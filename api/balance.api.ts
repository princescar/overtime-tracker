import { createRouter } from "@hattip/router";
import { z } from "zod";
import { isAfter } from "date-fns";
import { BalanceService } from "#services";
import {
  createErrorResponse,
  createSuccessResponse,
} from "#lib/responseFormatter";
import { getRequiredEnvVar } from "#lib/env";

const balanceService = new BalanceService();
const router = createRouter();

const userId = getRequiredEnvVar("MOCK_USER_ID");

// Get user balance
router.get("/api/balance", async () => {
  try {
    const balance = await balanceService.getBalance(userId);
    return createSuccessResponse({ balance });
  } catch (error) {
    return createErrorResponse(error);
  }
});

// Get balance history
router.get("/api/balance/history", async (context) => {
  try {
    const input = z
      .object({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
      })
      .parse(context.url.searchParams);

    // Validate date range
    if (
      input.startDate &&
      input.endDate &&
      isAfter(input.startDate, input.endDate)
    ) {
      throw new Error("End date must be after start date");
    }

    const history = await balanceService.getBalanceHistory({
      userId,
      ...input,
    });
    return createSuccessResponse(history);
  } catch (error) {
    return createErrorResponse(error);
  }
});

export default router;
