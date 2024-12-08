import mongoose from "mongoose";
import { getRequiredEnvVar } from "./env";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    const uri = getRequiredEnvVar("MONGODB_URI");
    await mongoose.connect(uri);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

/**
 * Execute a function within a MongoDB transaction
 * @param operation Async function to execute within the transaction
 * @returns Result of the operation
 */
export async function withTransaction<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      return await operation(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}
