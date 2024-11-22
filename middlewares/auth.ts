import { getRequiredEnvVar } from "#/lib/env";
import { RequestHandler } from "@hattip/compose";

declare module "@hattip/compose" {
  interface RequestContextExtensions {
    user: { id: string };
  }
}

const authHandler: RequestHandler = async (context) => {
  const userId = getRequiredEnvVar("MOCK_USER_ID");
  context.user = { id: userId };
  return await context.next();
};

export default authHandler;
