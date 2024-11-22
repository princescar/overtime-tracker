import { Schema, model, Document } from "mongoose";

export interface IWorklogDocument extends Omit<IWorklog, "id">, Document {}

const WorklogSchema = new Schema<IWorklogDocument>(
  {
    userId: { type: String, required: true, ref: "User" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: false },
    description: { type: String, required: true },
    location: {
      type: String,
      required: true,
      enum: Object.values(WorkLocation),
    },
    cost: { type: Number, required: false },
  },
  {
    timestamps: true,
  },
);

// Index for finding in-progress worklog
WorklogSchema.index({ userId: 1, endTime: 1 });
// Index for daily/weekly queries
WorklogSchema.index({ userId: 1, startTime: 1, endTime: 1 });
// Index for common queries
WorklogSchema.index({ userId: 1, startTime: -1 });

export const Worklog = model<IWorklogDocument>("Worklog", WorklogSchema);
