import { z } from "zod";
import { WorklogService } from "#/services/worklog.service";
import { WorkLocation } from "#/types/worklog";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import type { RequestHandler } from "./$types";

const worklogService = new WorklogService();

// Get a worklog
export const GET: RequestHandler = async ({ locals, params }) => {
  try {
    const userId = locals.user.id;
    const worklogId = params.id;

    const worklog = await worklogService.getWorklog({ worklogId, userId });

    return createSuccessResponse(worklog);
  } catch (error) {
    return createErrorResponse(error);
  }
};

// Modify a worklog
export const PATCH: RequestHandler = async ({ request, locals, params }) => {
  try {
    const userId = locals.user.id;
    const worklogId = params.id;
    const body = (await request.json()) as unknown;

    const { startTime, description, location } = z
      .object({
        startTime: z.coerce.date().optional(),
        description: z.string().nullable().optional(),
        location: z.nativeEnum(WorkLocation).optional(),
      })
      .parse(body);

    const worklog = await worklogService.modifyWork({
      worklogId,
      userId,
      startTime,
      description,
      location,
    });

    return createSuccessResponse(worklog);
  } catch (error) {
    return createErrorResponse(error);
  }
};

// Delete a worklog
export const DELETE: RequestHandler = async ({ locals, params }) => {
  try {
    const userId = locals.user.id;
    const worklogId = params.id;

    await worklogService.deleteWork({ worklogId, userId });

    return createSuccessResponse({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
};
