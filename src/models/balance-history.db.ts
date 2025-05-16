import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from "typeorm";
import { BalanceChangeType, type IBalanceHistory } from "#/types/balance";
import { User } from "./user.db";
import { Worklog } from "./worklog.db";
import { AppDataSource } from "#/utils/db";

@Entity("balance_history")
@Index(["userId", "timestamp"]) // Index for querying user's balance history
export class BalanceHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "float" })
  amount: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  timestamp: Date;

  @Column({ type: "enum", enum: BalanceChangeType })
  type: BalanceChangeType;

  @Column()
  description: string;

  @Column({ nullable: true })
  worklogId?: string;

  @ManyToOne(() => Worklog, { nullable: true })
  @JoinColumn({ name: "worklogId" })
  worklog?: Worklog;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDTO(): IBalanceHistory {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.amount,
      timestamp: this.timestamp,
      worklogId: this.worklogId,
      type: this.type,
      description: this.description,
    };
  }
}

export const BalanceHistoryRepository = AppDataSource.getRepository(BalanceHistory);
