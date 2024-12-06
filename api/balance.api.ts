import { Router } from "@hattip/router";
import { z } from "zod";
import dayjs from "dayjs";
import { BalanceService } from "#/services";
import {
  createErrorResponse,
  createSuccessResponse,
} from "#/lib/responseFormatter";

export default (app: Router) => {
  const balanceService = new BalanceService();

  // Get user balance
  app.get("/api/balance", async (context) => {
    try {
      const userId = context.user.id;

      const balance = await balanceService.getBalance(userId);

      return createSuccessResponse({ balance });
    } catch (error) {
      return createErrorResponse(error);
    }
  });

  // Get balance history
  app.get("/api/balance/history", async (context) => {
    try {
      const queryParams = Object.fromEntries(context.url.searchParams);

      const { startDate, endDate } = z
        .object({
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
        })
        .parse(queryParams);

      // Validate date range
      if (startDate && endDate && !dayjs(endDate).isAfter(startDate)) {
        throw new Error("End date must be after start date");
      }

      const history = await balanceService.getBalanceHistory({
        userId: context.user.id,
        startDate,
        endDate,
      });

      return createSuccessResponse(history);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
};
