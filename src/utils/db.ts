import { DataSource } from "typeorm";
import { getRequiredEnvVar } from "./env";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: getRequiredEnvVar("POSTGRES_HOST"),
  port: parseInt(getRequiredEnvVar("POSTGRES_PORT")),
  username: getRequiredEnvVar("POSTGRES_USER"),
  password: getRequiredEnvVar("POSTGRES_PASSWORD"),
  database: getRequiredEnvVar("POSTGRES_DB"),
  synchronize: true, // Set to false in production and use migrations
  logging: false,
  entities: [
  ],
});

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    console.log("Connecting to PostgreSQL...");
    await AppDataSource.initialize();
    isConnected = true;
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    throw error;
  }
}

/**
 * Execute a function within a PostgreSQL transaction
 * @param operation Async function to execute within the transaction
 * @returns Result of the operation
 */
export async function withTransaction<T>(
  operation: (queryRunner: any) => Promise<T>,
): Promise<T> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    const result = await operation(queryRunner);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
