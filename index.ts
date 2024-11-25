import dotenv from "dotenv";
import { createRouter } from "@hattip/router";
import { renderPage } from "vike/server";
import { connectDB } from "#/lib/db";
import initAuthHandlers from "#/middlewares/auth";
import initApiHandlers from "#/api";

dotenv.config();

await connectDB();

const app = createRouter();

initAuthHandlers(app);
initApiHandlers(app);

app.use(async (context) => {
  const { httpResponse } = await renderPage({
    urlOriginal: context.url.toString(),
    user: context.user,
  });
  const { body, statusCode, headers } = httpResponse;
  return new Response(body, {
    status: statusCode,
    headers: headers,
  });
});

export default app.buildHandler();
