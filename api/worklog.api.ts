import { Router, RouterContext } from "@hattip/router";
import { z } from "zod";
import { WorklogService } from "#/services";
import { WorkLocation, WorklogStatus } from "#/models";
import {
  createErrorResponse,
  createSuccessResponse,
} from "#/lib/responseFormatter";

export default (app: Router) => {
  const worklogService = new WorklogService();

  // Start work
  app.post("/api/worklogs/start", async (context) => {
    try {
      const body = (await context.request.json()) as unknown;

      const { description, location, startTime } = z
        .object({
          description: z.string().optional(),
          location: z.nativeEnum(WorkLocation),
          startTime: z.coerce.date(),
        })
        .parse(body);

      const worklog = await worklogService.startWork({
        userId: context.user.id,
        startTime,
        location,
        description,
      });

      return createSuccessResponse(worklog);
    } catch (error) {
      return createErrorResponse(error);
    }
  });

  // Complete work
  app.post(
    "/api/worklogs/:id/complete",
    async (context: RouterContext<{ id: string }>) => {
      try {
        const userId = context.user.id;
        const worklogId = context.params.id;
        const body = (await context.request.json()) as unknown;

        const { endTime } = z
          .object({
            endTime: z.coerce.date(),
          })
          .parse(body);

        const worklog = await worklogService.completeWork({
          worklogId,
          userId,
          endTime,
        });

        return createSuccessResponse(worklog);
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );

  // Modify worklog
  app.patch(
    "/api/worklogs/:id",
    async (context: RouterContext<{ id: string }>) => {
      try {
        const userId = context.user.id;
        const worklogId = context.params.id;
        const body = (await context.request.json()) as unknown;

        const { startTime, description, location } = z
          .object({
            startTime: z.coerce.date().optional(),
            description: z.string().optional(),
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
    },
  );

  // Create completed worklog
  app.post("/api/worklogs", async (context) => {
    try {
      const userId = context.user.id;
      const body = (await context.request.json()) as unknown;

      const { startTime, endTime, description, location } = z
        .object({
          startTime: z.coerce.date(),
          endTime: z.coerce.date(),
          description: z.string().optional(),
          location: z.nativeEnum(WorkLocation),
        })
        .parse(body);

      const worklog = await worklogService.createCompletedWork({
        userId,
        startTime,
        endTime,
        description,
        location,
      });

      return createSuccessResponse(worklog);
    } catch (error) {
      return createErrorResponse(error);
    }
  });

  // Delete worklog
  app.delete(
    "/api/worklogs/:id",
    async (context: RouterContext<{ id: string }>) => {
      try {
        const userId = context.user.id;
        const worklogId = context.params.id;

        await worklogService.deleteWork({ worklogId, userId });

        return createSuccessResponse({ success: true });
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );

  // Get worklog
  app.get(
    "/api/worklog/:id",
    async (context: RouterContext<{ id: string }>) => {
      try {
        const userId = context.user.id;
        const worklogId = context.params.id;

        const worklog = await worklogService.getWorklog({ worklogId, userId });

        return createSuccessResponse(worklog);
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );

  // Query worklogs
  app.get("/api/worklogs", async (context) => {
    try {
      const userId = context.user.id;
      const queryParams = Object.fromEntries(context.url.searchParams);

      const { startDate, endDate, status } = z
        .object({
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
          status: z.nativeEnum(WorklogStatus).optional(),
        })
        .parse(queryParams);

      const worklogs = await worklogService.getUserWorks({
        userId,
        startDate,
        endDate,
        status,
      });

      return createSuccessResponse(worklogs);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
};
