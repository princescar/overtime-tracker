import { UserService } from "#/services/user.service";
import { BalanceService } from "#/services/balance.service";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import { getRequiredEnvVar, getRequiredNumericEnvVar } from "#/utils/env";
import type { RequestHandler } from "./$types";
import { withTransaction } from "#/utils/db";
import { BalanceChangeType } from "#/types/balance";

const userService = new UserService();
const balanceService = new BalanceService();

// Cron execution endpoint
export const GET: RequestHandler = async ({ request }) => {
  const cronSecret = getRequiredEnvVar("CRON_SECRET");
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const balanceIncrement = getRequiredNumericEnvVar("CRON_BALANCE_INCREMENT");
  const users = await userService.getAllUsers();

  for (const user of users) {
    console.log("Processing user", user.id);
    try {
      await withTransaction(async (session) => {
        await balanceService.incrementBalance(
          {
            userId: user.id,
            amount: balanceIncrement,
            type: BalanceChangeType.CRON,
            description: `Cron job running at ${new Date().toISOString()}`,
          },
          session,
        );
      });
      console.log("Processed user", user.id);
    } catch (error) {
      console.error("Error processing user", user.id, error);
    }
  }

  try {
    return createSuccessResponse({ message: "Cron job executed successfully" });
  } catch (error) {
    return createErrorResponse(error);
  }
};
