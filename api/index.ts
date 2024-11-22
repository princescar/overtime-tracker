import { compose } from "@hattip/compose";
import { createRouter } from "@hattip/router";
import worklogRouter from "./worklog.api";
import balanceRouter from "./balance.api";

// 404 handler for API routes
const notFoundRouter = createRouter();
notFoundRouter.use("/api/*", () => {
  return Response.json(
    {
      error: "Not Found",
      message: "The requested API endpoint does not exist",
      status: 404,
    },
    { status: 404 },
  );
});

export default compose(
  // API routes should be handled first
  worklogRouter.handlers,
  balanceRouter.handlers,
  // Then fall back to router for 404 handling
  notFoundRouter.handlers,
);
