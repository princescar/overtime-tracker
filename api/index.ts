import { Router } from "@hattip/router";
import initWorklogHandlers from "./worklog.api";
import initBalanceHandlers from "./balance.api";

export default (app: Router) => {
  initWorklogHandlers(app);
  initBalanceHandlers(app);

  app.use("/api/*", () => {
    return Response.json(
      {
        error: "Not Found",
        message: "The requested API endpoint does not exist",
        status: 404,
      },
      { status: 404 },
    );
  });
};
