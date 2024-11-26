import mongoose, { Document, Model, Schema } from "mongoose";
import { BalanceChangeType, IBalanceHistory } from "../balance";

export interface IBalanceHistoryDocument
  extends Omit<IBalanceHistory, "id">,
    Document {}

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
  (mongoose.models.BalanceHistory as Model<IBalanceHistoryDocument>) ||
  mongoose.model<IBalanceHistoryDocument>(
    "BalanceHistory",
    balanceHistorySchema,
  );
