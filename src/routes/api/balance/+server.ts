import { BalanceService } from "#/services/balance.service";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import type { RequestHandler } from "./$types";

const balanceService = new BalanceService();

// Get user balance
export const GET: RequestHandler = async ({ locals }) => {
  try {
    const userId = locals.user.id;

    const balance = await balanceService.getBalance(userId);

    return createSuccessResponse({ balance });
  } catch (error) {
    return createErrorResponse(error);
  }
};
