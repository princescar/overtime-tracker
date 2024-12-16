import { z } from "zod";
import { WorklogService } from "#/services/worklog.service";
import { WorkLocation } from "#/types/worklog";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import type { RequestHandler } from "./$types";

const worklogService = new WorklogService();

// Create a completed worklog
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user.id;
    const body = (await request.json()) as unknown;

    const { startTime, endTime, location, description } = z
      .object({
        startTime: z.string(),
        endTime: z.string(),
        location: z.nativeEnum(WorkLocation),
        description: z.string().optional(),
      })
      .parse(body);

    const worklog = await worklogService.createCompletedWork({
      userId,
      startTime,
      endTime,
      location,
      description,
    });

    return createSuccessResponse(worklog);
  } catch (error) {
    return createErrorResponse(error);
  }
};
