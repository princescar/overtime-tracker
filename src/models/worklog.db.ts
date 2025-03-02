import mongoose, { type Document, type Model, type ObjectId } from "mongoose";
import { type IWorklog, WorkLocation } from "#/types/worklog";

export interface IWorklogDocument extends Omit<IWorklog, "id">, Document<ObjectId> {
  deleted: boolean;
}

const { model, models, Schema } = mongoose;

const WorklogSchema = new Schema<IWorklogDocument>(
  {
    userId: { type: String, required: true, ref: "User" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: false },
    description: { type: String },
    location: {
      type: String,
      required: true,
      enum: Object.values(WorkLocation),
    },
    deleted: { type: Boolean, default: false },
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

export const Worklog =
  (models.Worklog as Model<IWorklogDocument> | undefined) ??
  model<IWorklogDocument>("Worklog", WorklogSchema);
