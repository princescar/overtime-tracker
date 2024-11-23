import dotenv from "dotenv";
import { createRouter } from "@hattip/router";
import { renderPage } from "vike/server";
import { connectDB } from "#/lib/db";
import { getEnvVar } from "#/lib/env";
import initAuthHandlers from "#/middlewares/auth";
import initApiHandlers from "#/api";

dotenv.config();

await connectDB();

// Manual import server entry is need for plugin to work with ES modules.
// https://github.com/brillout/vite-plugin-server-entry/blob/main/readme.md#manual-import
if (getEnvVar("NODE_ENV", "development") === "production") {
  // Use variable to cheat the build check.
  const serverEntryPoint = "./entry.mjs";
  await import(serverEntryPoint);
}

const app = createRouter();

initAuthHandlers(app);
initApiHandlers(app);

app.use(async (context) => {
  const { httpResponse } = await renderPage({
    urlOriginal: context.url.toString(),
  });
  const { body, statusCode, headers } = httpResponse;
  return new Response(body, {
    status: statusCode,
    headers: headers,
  });
});

export default app.buildHandler();
