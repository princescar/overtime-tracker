import { FilterQuery, Types } from "mongoose";
import dayjs from "dayjs";
import { BalanceService } from "#/services";
import { IWorklog, WorkLocation, WorklogStatus } from "#/types";
import { IWorklogDocument, Worklog } from "#/models";
import {
  validateDate,
  validateWorkLocation,
  withTransaction,
  getRequiredNumericEnvVar,
} from "#/utils";

interface StartWorkInput {
  userId: string;
  startTime: Date | string;
  description?: string;
  location: WorkLocation;
}

interface CompleteWorkInput {
  worklogId: string;
  userId: string;
  endTime: Date | string;
}

interface ModifyWorkInput {
  worklogId: string;
  userId: string;
  startTime?: Date | string;
  description?: string;
  location?: WorkLocation;
}

interface CreateCompletedWorkInput {
  userId: string;
  startTime: Date | string;
  endTime: Date | string;
  description?: string;
  location: WorkLocation;
}

interface DeleteWorkInput {
  worklogId: string;
  userId: string;
}

interface GetWorklogInput {
  worklogId: string;
  userId: string;
}

interface QueryWorklogsInput {
  userId: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: WorklogStatus;
  page?: number;
  limit?: number;
}

export class WorklogService {
  /**
   * Start a new work session
   */
  async startWork(input: StartWorkInput): Promise<IWorklog> {
    const { userId, startTime, description, location } = input;

    // Validate inputs
    validateDate(startTime, "startTime");
    validateWorkLocation(location);
    const parsedStartTime = dayjs(startTime).startOf("minute").toDate();

    // Validate work time constraints
    this.validateWorkTime(parsedStartTime);

    // Check if user exists and has positive balance
    await this.balanceService.validateBalance(userId);

    // Check if user has any in-progress work
    const inProgressWork = await Worklog.findOne({
      userId,
      endTime: { $exists: false },
      deleted: { $ne: true },
    });

    if (inProgressWork) {
      throw new Error("User already has in-progress work");
    }

    // Check for overlapping work sessions
    const overlappingWork = await Worklog.findOne({
      userId,
      startTime: { $lte: parsedStartTime },
      endTime: { $gt: parsedStartTime },
      deleted: { $ne: true },
    });

    if (overlappingWork) {
      throw new Error("New work session overlaps with an existing session");
    }

    // Create new worklog
    const worklog = await Worklog.create({
      userId,
      startTime: parsedStartTime,
      description,
      location,
    });

    return this.toWorklog(worklog);
  }

  /**
   * Complete a work session
   */
  async completeWork(input: CompleteWorkInput): Promise<IWorklog> {
    const { userId, worklogId, endTime } = input;

    // Validate inputs
    validateDate(endTime, "endTime");
    const parsedEndTime = dayjs(endTime).startOf("minute").toDate();

    // Find and validate worklog
    const worklog = await Worklog.findOne({
      _id: worklogId,
      userId,
      deleted: { $ne: true },
    });
    if (!worklog) {
      throw new Error("Worklog not found");
    }

    if (worklog.endTime) {
      throw new Error("Work is already completed");
    }

    // Validate work time constraints
    this.validateWorkTime(worklog.startTime, parsedEndTime);

    // Check for overlapping work sessions
    await this.validateNoOverlap(
      userId,
      worklog.startTime,
      parsedEndTime,
      worklogId,
    );

    // Calculate cost
    const cost = this.calculateCost(worklog.startTime, parsedEndTime);

    const savedWorklog = await withTransaction(async (session) => {
      // Update worklog
      worklog.endTime = parsedEndTime;
      const savedWorklog = await worklog.save({ session });

      // Deduct cost from user's balance atomically with balance check
      await this.balanceService.deductWorklogCost(
        userId,
        cost,
        worklogId,
        session,
      );

      return savedWorklog;
    });

    return this.toWorklog(savedWorklog);
  }

  /**
   * Modify an in-progress work session
   */
  async modifyWork(input: ModifyWorkInput): Promise<IWorklog> {
    const { userId, worklogId, startTime, description, location } = input;

    const worklog = await Worklog.findOne({
      _id: worklogId,
      userId,
      deleted: { $ne: true },
    });
    if (!worklog) {
      throw new Error("Worklog not found");
    }

    if (worklog.endTime) {
      throw new Error("Cannot modify completed work");
    }

    if (startTime) {
      validateDate(startTime, "startTime");
      const parsedStartTime = dayjs(startTime).startOf("minute").toDate();
      // Validate new start time
      this.validateWorkTime(parsedStartTime);
      worklog.startTime = parsedStartTime;
    }

    if (description) worklog.description = description;

    if (location) {
      validateWorkLocation(location);
      worklog.location = location;
    }

    const savedWorklog = await worklog.save();
    return this.toWorklog(savedWorklog);
  }

  /**
   * Create a completed work entry directly
   */
  async createCompletedWork(
    input: CreateCompletedWorkInput,
  ): Promise<IWorklog> {
    const { userId, startTime, endTime, description, location } = input;

    // Validate inputs
    validateDate(startTime, "startTime");
    validateDate(endTime, "endTime");
    validateWorkLocation(location);
    const parsedStartTime = dayjs(startTime).startOf("minute").toDate();
    const parsedEndTime = dayjs(endTime).startOf("minute").toDate();

    // Validate work time constraints
    this.validateWorkTime(parsedStartTime, parsedEndTime);

    // Check for overlapping work sessions
    await this.validateNoOverlap(userId, parsedStartTime, parsedEndTime);

    // Calculate cost
    const cost = this.calculateCost(parsedStartTime, parsedEndTime);

    const savedWorklog = await withTransaction(async (session) => {
      // Create completed worklog
      const [worklog] = await Worklog.create(
        [
          {
            userId,
            startTime: parsedStartTime,
            endTime: parsedEndTime,
            description,
            location,
            cost,
          },
        ],
        { session },
      );

      // Deduct cost from user's balance atomically with balance check
      await this.balanceService.deductWorklogCost(
        userId,
        cost,
        worklog.id as string,
        session,
      );

      return worklog;
    });

    return this.toWorklog(savedWorklog);
  }

  /**
   * Delete an in-progress work session
   */
  async deleteWork(input: DeleteWorkInput): Promise<void> {
    const { worklogId, userId } = input;

    const worklog = await Worklog.findOne({ _id: worklogId, userId });
    if (!worklog) {
      throw new Error("Worklog not found");
    }

    if (worklog.endTime) {
      throw new Error("Cannot delete completed work");
    }

    // Mark as deleted instead of removing
    worklog.deleted = true;
    await worklog.save();
  }

  /**
   * Get a specific worklog
   */
  async getWorklog(input: GetWorklogInput): Promise<IWorklog> {
    const { userId, worklogId } = input;

    const worklog = await Worklog.findOne({
      _id: worklogId,
      userId,
      deleted: { $ne: true },
    });
    if (!worklog) {
      throw new Error("Worklog not found");
    }
    return this.toWorklog(worklog);
  }

  /**
   * Get user's worklogs with optional filters
   */
  async queryWorklogs(input: QueryWorklogsInput): Promise<IWorklog[]> {
    const { userId, startDate, endDate, status, page = 1, limit = 10 } = input;

    const query: FilterQuery<IWorklogDocument> = {
      userId,
      deleted: { $ne: true }, // Filter out deleted worklogs
    };

    if (startDate || endDate) {
      if (startDate) validateDate(startDate, "startDate");
      if (endDate) validateDate(endDate, "endDate");
      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      if (
        parsedStartDate &&
        parsedEndDate &&
        dayjs(parsedStartDate).isAfter(parsedEndDate)
      ) {
        throw new Error("Start date must be before end date");
      }

      query.$or = [
        { startTime: { $lte: parsedEndDate } },
        { endTime: { $gte: parsedStartDate } },
      ];
    }

    if (status === WorklogStatus.IN_PROGRESS) {
      query.$or = [{ endTime: { $exists: false } }, { endTime: null }];
    } else if (status === WorklogStatus.COMPLETED) {
      query.$and = [{ endTime: { $exists: true } }, { endTime: { $ne: null } }];
    }

    const skip = (page - 1) * limit;
    const worklogs = await Worklog.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);
    return worklogs.map((doc) => this.toWorklog(doc));
  }

  private balanceService = new BalanceService();

  /**
   * Validate work time constraints
   */
  private validateWorkTime(startTime: Date, endTime?: Date) {
    if (endTime) {
      // Validate end time is after start time
      if (
        dayjs(startTime).isAfter(endTime) ||
        dayjs(startTime).isSame(endTime, "minute")
      ) {
        throw new Error("End time must be after start time");
      }
    }
  }

  /**
   * Check for overlapping work sessions
   */
  private async validateNoOverlap(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeWorklogId?: string,
  ): Promise<void> {
    const query: FilterQuery<IWorklogDocument> = {
      userId,
      deleted: { $ne: true }, // Don't consider deleted worklogs for overlap
      $or: [
        {
          startTime: { $lte: endTime },
          endTime: { $gte: startTime },
        },
        {
          startTime: { $lte: endTime },
          endTime: { $exists: false },
        },
      ],
    };

    if (excludeWorklogId) {
      query._id = { $ne: excludeWorklogId };
    }

    const overlappingWork = await Worklog.findOne(query);
    if (overlappingWork) {
      throw new Error("Work session would overlap with another session");
    }
  }

  /**
   * Calculate work duration and cost
   */
  private calculateCost(startTime: Date, endTime: Date): number {
    const duration = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(duration / (1000 * 60));
    const costRate = getRequiredNumericEnvVar("WORK_COST_PER_MINUTE");
    return durationMinutes * costRate;
  }

  /**
   * Transform worklog document to business object
   */
  private toWorklog(doc: IWorklogDocument): IWorklog {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      userId: doc.userId,
      startTime: doc.startTime,
      endTime: doc.endTime,
      description: doc.description,
      location: doc.location,
    };
  }
}
