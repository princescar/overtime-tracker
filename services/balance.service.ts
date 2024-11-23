import { ClientSession, FilterQuery } from "mongoose";
import { BalanceChangeType } from "#/models";
import { User, BalanceHistory, IBalanceHistoryDocument } from "#/models/db";

interface GetBalanceHistoryInput {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

interface UpdateBalanceInput {
  userId: string;
  amount: number;
  type: BalanceChangeType;
  description: string;
  worklogId?: string;
}

export class BalanceService {
  /**
   * Get user's current balance
   */
  async getBalance(userId: string): Promise<number> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.balance;
  }

  /**
   * Validate user has sufficient balance
   */
  async validateBalance(userId: string): Promise<void> {
    const balance = await this.getBalance(userId);
    if (balance <= 0) {
      throw new Error("Insufficient balance to log work");
    }
  }

  /**
   * Update user balance and record the change in history
   * Must be called within a transaction
   */
  async updateBalance(
    input: UpdateBalanceInput,
    session: ClientSession,
  ): Promise<void> {
    const { userId, amount, type, description, worklogId } = input;

    // Update the balance
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } },
      { session, new: true },
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Check if balance is still sufficient after update
    if (updatedUser.balance < 0) {
      throw new Error("Balance would become insufficient after this operation");
    }

    // Create balance history entry
    await BalanceHistory.create(
      [
        {
          userId,
          amount,
          type,
          description,
          worklogId,
          timestamp: new Date(),
        },
      ],
      { session },
    );
  }

  /**
   * Convenience method for worklog-related balance deductions
   */
  async deductWorklogCost(
    userId: string,
    amount: number,
    worklogId: string,
    session: ClientSession,
  ): Promise<void> {
    await this.updateBalance(
      {
        userId,
        amount: -amount,
        type: BalanceChangeType.WORKLOG,
        description: "Balance deducted for worklog entry",
        worklogId,
      },
      session,
    );
  }

  /**
   * Get user's balance history
   */
  async getBalanceHistory(input: GetBalanceHistoryInput) {
    const { userId, startDate, endDate } = input;

    const query: FilterQuery<IBalanceHistoryDocument> = { userId };

    if (startDate || endDate) {
      query.$or = [
        { timestamp: { $lte: endDate } },
        { timestamp: { $gte: startDate } },
      ];
    }

    return BalanceHistory.find(query)
      .sort({ timestamp: -1 })
      .populate("worklogId");
  }
}
