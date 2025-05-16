import { QueryRunner, Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere } from "typeorm";
import { BalanceChangeType } from "#/types/balance";
import { UserRepository, User } from "#/models/user.db";
import { BalanceHistoryRepository, BalanceHistory } from "#/models/balance-history.db";

interface GetBalanceHistoryInput {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

interface IncrementBalanceInput {
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
    const user = await UserRepository.findOne({ where: { id: userId } });
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
   * Increment user balance by amount, and record the change in history
   * Must be called within a transaction
   */
  async incrementBalance(input: IncrementBalanceInput, queryRunner: QueryRunner): Promise<void> {
    const { userId, amount, type, description, worklogId } = input;

    // Update the balance
    const userRepository = queryRunner.manager.getRepository(User);
    
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update balance
    user.balance += amount;
    
    await userRepository.save(user);

    // Check if balance is still sufficient after update
    if (user.balance < 0) {
      throw new Error("Balance would become insufficient after this operation");
    }

    // Create balance history entry
    const balanceHistoryRepository = queryRunner.manager.getRepository(BalanceHistory);
    const balanceHistory = new BalanceHistory();
    balanceHistory.userId = userId;
    balanceHistory.amount = amount;
    balanceHistory.type = type;
    balanceHistory.description = description;
    balanceHistory.worklogId = worklogId;
    balanceHistory.timestamp = new Date();
    
    await balanceHistoryRepository.save(balanceHistory);
  }

  /**
   * Convenience method for worklog-related balance deductions
   */
  async deductWorklogCost(
    userId: string,
    amount: number,
    worklogId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await this.incrementBalance(
      {
        userId,
        amount: -amount,
        type: BalanceChangeType.WORKLOG,
        description: "Balance deducted for worklog entry",
        worklogId,
      },
      queryRunner,
    );
  }

  /**
   * Convenience method for revert worklog-related balance deductions
   */
  async revertWorklogCost(
    userId: string,
    amount: number,
    worklogId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await this.incrementBalance(
      {
        userId,
        amount,
        type: BalanceChangeType.WORKLOG,
        description: "Revert balance deduction for worklog entry",
        worklogId,
      },
      queryRunner,
    );
  }

  /**
   * Get user's balance history
   */
  async getBalanceHistory(input: GetBalanceHistoryInput) {
    const { userId, startDate, endDate } = input;

    const where: FindOptionsWhere<BalanceHistory> = { userId };

    if (startDate && endDate) {
      where.timestamp = Between(startDate, endDate);
    } else if (startDate) {
      where.timestamp = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.timestamp = LessThanOrEqual(endDate);
    }

    return BalanceHistoryRepository.find({
      where,
      order: { timestamp: "DESC" },
      relations: ["worklog"]
    });
  }
}
