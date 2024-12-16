import { z } from "zod";
import { WorklogService } from "#/services/worklog.service";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import type { RequestHandler } from "./$types";

const worklogService = new WorklogService();

// Complete an in-progress work
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const userId = locals.user.id;
    const worklogId = params.id;
    const body = (await request.json()) as unknown;

    const { endTime } = z.object({ endTime: z.coerce.date() }).parse(body);

    const worklog = await worklogService.completeWork({
      worklogId,
      userId,
      endTime,
    });

    return createSuccessResponse(worklog);
  } catch (error) {
    return createErrorResponse(error);
  }
};
