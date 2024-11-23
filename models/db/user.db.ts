import mongoose, { Document } from "mongoose";
import { IUser } from "../user";

export interface IUserDocument extends Omit<IUser, "id">, Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
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

export const User = mongoose.model<IUserDocument>("User", userSchema);
