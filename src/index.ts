import dotenv from "dotenv";
import { createRouter } from "@hattip/router";
import { cookieParser } from "@hattip/cookie/parse";
import { renderPage } from "vike/server";
import { connectDB, detectLanguage } from "#/utils";
import initAuthHandlers from "#/middlewares/auth";
import initApiHandlers from "#/controllers";

dotenv.config();

await connectDB();

const app = createRouter();
app.use(cookieParser());

initAuthHandlers(app);
initApiHandlers(app);

app.use(async ({ request, cookie, url, user }) => {
  const language = detectLanguage(
    request.headers.get("accept-language"),
    cookie["language"],
  );

  const { httpResponse } = await renderPage({
    userAgent: request.headers.get("user-agent"),
    urlOriginal: url.toString(),
    user,
    language,
  });

  const { statusCode, headers } = httpResponse;
  const bodyStream = httpResponse.getReadableWebStream();
  return new Response(bodyStream, {
    status: statusCode,
    headers,
  });
});

export default app.buildHandler();
