import { z } from "zod";
import { WorklogService } from "#/services/worklog.service";
import { WorklogStatus } from "#/types/worklog";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import type { RequestHandler } from "./$types";

const worklogService = new WorklogService();

// Query worklogs
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const userId = locals.user.id;
    const queryParams = Object.fromEntries(url.searchParams);

    const { startDate, endDate, status, skip, limit } = z
      .object({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        status: z.nativeEnum(WorklogStatus).optional(),
        skip: z.coerce.number().min(0).optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
      })
      .parse(queryParams);

    const [worklogs, total] = await Promise.all([
      worklogService.queryWorklogs({
        userId,
        startDate,
        endDate,
        status,
        skip,
        limit,
      }),
      worklogService.countWorklogs({ userId, startDate, endDate, status }),
    ]);

    return createSuccessResponse({ worklogs, total });
  } catch (error) {
    console.error("Error querying worklogs:", error);
    return createErrorResponse(error);
  }
};
