import { createRouter, RouterContext } from "@hattip/router";
import { z } from "zod";
import { WorklogService } from "#services";
import {
  createErrorResponse,
  createSuccessResponse,
} from "#lib/responseFormatter";
import { getRequiredEnvVar } from "#lib/env";

const worklogService = new WorklogService();
const router = createRouter();

const userId = getRequiredEnvVar("MOCK_USER_ID");

// Start work
router.post("/api/worklogs/start", async (context) => {
  try {
    const body = (await context.request.json()) as unknown;
    const input = z
      .object({
        description: z.string().optional(),
        location: z.nativeEnum(WorkLocation),
        startTime: z.coerce.date(),
      })
      .parse(body);
    const worklog = await worklogService.startWork({
      ...input,
      userId,
    });
    return createSuccessResponse(worklog);
  } catch (error) {
    return createErrorResponse(error);
  }
});

// Complete work
router.post(
  "/api/worklogs/:id/complete",
  async (context: RouterContext<{ id: string }>) => {
    try {
      const { id } = context.params;
      const body = (await context.request.json()) as unknown;
      const input = z
        .object({
          endTime: z.coerce.date(),
        })
        .parse(body);
      const worklog = await worklogService.completeWork({
        worklogId: id,
        userId,
        ...input,
      });
      return createSuccessResponse(worklog);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
);

// Modify worklog
router.patch(
  "/api/worklogs/:id",
  async (context: RouterContext<{ id: string }>) => {
    try {
      const { id } = context.params;
      const body = (await context.request.json()) as unknown;
      const input = z
        .object({
          startTime: z.coerce.date().optional(),
          description: z.string().optional(),
          location: z.nativeEnum(WorkLocation).optional(),
        })
        .parse(body);
      const worklog = await worklogService.modifyWork({
        ...input,
        worklogId: id,
        userId,
      });
      return createSuccessResponse(worklog);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
);

// Create completed worklog
router.post("/api/worklogs", async (context) => {
  try {
    const body = (await context.request.json()) as unknown;
    const input = z
      .object({
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        description: z.string().optional(),
        location: z.nativeEnum(WorkLocation),
      })
      .parse(body);
    const worklog = await worklogService.createCompletedWork({
      ...input,
      userId,
    });
    return createSuccessResponse(worklog);
  } catch (error) {
    return createErrorResponse(error);
  }
});

// Delete worklog
router.delete("/api/worklogs", async (context) => {
  try {
    const body = (await context.request.json()) as unknown;
    const input = z
      .object({
        worklogId: z.string(),
      })
      .parse(body);
    await worklogService.deleteWork({
      ...input,
      userId,
    });
    return createSuccessResponse({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
});

// Get worklog
router.get(
  "/api/worklog/:id",
  async (context: RouterContext<{ id: string }>) => {
    try {
      const { id } = context.params;
      const worklog = await worklogService.getWorklog({
        worklogId: id,
        userId,
      });
      return createSuccessResponse(worklog);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
);

// Query worklogs
router.get("/api/worklogs", async (context) => {
  try {
    const input = z
      .object({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        status: z.nativeEnum(WorklogStatus).optional(),
      })
      .parse(context.url.searchParams);
    const worklogs = await worklogService.getUserWorks({
      ...input,
      userId,
    });
    return createSuccessResponse(worklogs);
  } catch (error) {
    return createErrorResponse(error);
  }
});

export default router;
