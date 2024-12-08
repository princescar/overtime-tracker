import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "#/types";

export interface IUserDocument extends Omit<IUser, "id">, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const User =
  (mongoose.models.User as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>("User", userSchema);
