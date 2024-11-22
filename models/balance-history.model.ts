import mongoose, { Document } from "mongoose";

export interface IBalanceHistory {
  userId: string;
  amount: number;
  timestamp: Date;
  type: BalanceChangeType;
  description: string;
  worklogId?: string;
}

export interface IBalanceHistoryDocument
  extends Omit<IBalanceHistory, "id">,
    Document {}

const balanceHistorySchema = new mongoose.Schema<IBalanceHistoryDocument>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(BalanceChangeType),
    },
    description: {
      type: String,
      required: true,
    },
    worklogId: {
      type: String,
      required: false,
      ref: "Worklog",
    },
  },
  {
    timestamps: true,
  },
);

// Index for querying user's balance history
balanceHistorySchema.index({ userId: 1, timestamp: -1 });

export const BalanceHistory = mongoose.model<IBalanceHistoryDocument>(
  "BalanceHistory",
  balanceHistorySchema,
);
