import mongoose, { type Document, type Model } from "mongoose";
import { BalanceChangeType, type IBalanceHistory } from "#/types/balance";

export interface IBalanceHistoryDocument extends Omit<IBalanceHistory, "id">, Document {}

const { model, models, Schema } = mongoose;

const balanceHistorySchema = new Schema<IBalanceHistoryDocument>(
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
      enum: Object.values(BalanceChangeType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    worklogId: {
      type: String,
      ref: "Worklog",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for querying user's balance history
balanceHistorySchema.index({ userId: 1, timestamp: -1 });

export const BalanceHistory =
  (models.BalanceHistory as Model<IBalanceHistoryDocument> | undefined) ??
  model<IBalanceHistoryDocument>("BalanceHistory", balanceHistorySchema);
