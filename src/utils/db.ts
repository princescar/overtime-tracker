import { DataSource, type DataSourceOptions } from "typeorm";
import { getRequiredEnvVar } from "./env";

export const AppDataSource = new DataSource({
  type: "postgres", // Always specify a driver to avoid MissingDriverError
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "test",
  synchronize: false,
  logging: false,
  entities: [], // Will be populated at runtime
});

const getDataSourceOptions = (): DataSourceOptions => {
  try {
    return {
      type: "postgres",
      host: process.env.POSTGRES_HOST || "localhost",
      port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
      username: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DB || "overtime_tracker",
      synchronize: true, // Set to false in production and use migrations
      logging: false,
      entities: [],
    };
  } catch (error) {
    console.warn("Using minimal DB config for build");
    return {
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "test",
      synchronize: false,
      logging: false,
      entities: [],
    };
  }
};

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    console.log("Connecting to PostgreSQL...");
    
    if (!AppDataSource.isInitialized) {
      const completeOptions = {
        ...getDataSourceOptions(),
        entities: [
          __dirname + '/../models/*.db.{ts,js}',
        ]
      };
      
      Object.assign(AppDataSource.options, completeOptions);
      await AppDataSource.initialize();
    }
    
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
