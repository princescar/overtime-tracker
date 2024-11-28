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
  const acceptLanguage = context.request.headers.get("accept-language") || "";
  const language = acceptLanguage.toLowerCase().includes("zh") ? "zh" : "en";

  const { httpResponse } = await renderPage({
    userAgent: context.request.headers.get("user-agent") || "unknown",
    urlOriginal: context.url.toString(),
    user: context.user,
    language,
  });
  const { statusCode, headers } = httpResponse;
  return new Response(httpResponse.getReadableWebStream(), {
    status: statusCode,
    headers: headers,
  });
});

export default app.buildHandler();
