import { compose } from "@hattip/compose";
import { renderPage } from "vike/server";
import dotenv from "dotenv";
import { connectDB } from "#lib/db";
import apiRoutes from "./api";

// Load environment variables from .env file
dotenv.config();

await connectDB();

export default compose(
  // API routes should be handled first
  apiRoutes,
  // Then fall back to Vike for page rendering
  async (context) => {
    const { httpResponse } = await renderPage({
      urlOriginal: context.url.toString(),
    });
    const { body, statusCode, headers } = httpResponse;
    return new Response(body, {
      status: statusCode,
      headers: headers,
    });
  },
);
