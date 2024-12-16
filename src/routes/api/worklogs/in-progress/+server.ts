import { z } from "zod";
import { WorklogService } from "#/services/worklog.service";
import { WorkLocation } from "#/types/worklog";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import type { RequestHandler } from "./$types";

const worklogService = new WorklogService();

// Start an in-progress work
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user.id;
    const body = (await request.json()) as unknown;

    const { description, location, startTime } = z
      .object({
        description: z.string().optional(),
        location: z.nativeEnum(WorkLocation),
        startTime: z.coerce.date(),
      })
      .parse(body);

    const worklog = await worklogService.startWork({
      userId,
      startTime,
      location,
      description,
    });

    return createSuccessResponse(worklog);
  } catch (error) {
    return createErrorResponse(error);
  }
};
