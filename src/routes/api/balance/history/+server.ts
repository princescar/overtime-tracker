import dayjs from "dayjs";
import { z } from "zod";
import { BalanceService } from "#/services/balance.service";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import type { RequestHandler } from "./$types";

const balanceService = new BalanceService();

// Get balance history
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const userId = locals.user.id;
    const queryParams = Object.fromEntries(url.searchParams);

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
      userId,
      startDate,
      endDate,
    });

    return createSuccessResponse(history);
  } catch (error) {
    return createErrorResponse(error);
  }
};
