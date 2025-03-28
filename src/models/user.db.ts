import mongoose, { type Document, type Model, type ObjectId } from "mongoose";
import type { IUser } from "#/types/user";

export interface IUserDocument extends Omit<IUser, "id">, Document<ObjectId> {}

const { model, models, Schema } = mongoose;

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
  (models.User as Model<IUserDocument> | undefined) ?? model<IUserDocument>("User", userSchema);
