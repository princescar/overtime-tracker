import { Router } from "@hattip/router";
import { getRequiredEnvVar } from "#/lib/env";

declare module "@hattip/compose" {
  interface RequestContextExtensions {
    user: { id: string };
  }
}

export default (app: Router) => {
  app.use((context) => {
    const userId = getRequiredEnvVar("MOCK_USER_ID");
    context.user = { id: userId };
    return context.next();
  });
};
