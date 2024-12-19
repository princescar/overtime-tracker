import type { Handle, ServerInit } from "@sveltejs/kit";
import dotenv from "dotenv";
import { connectDB } from "#/utils/db";
import { detectLanguage } from "#/utils/i18n";
import { getRequiredEnvVar } from "#/utils/env";
import { changeLanguage } from "#/stores/messages.svelte";

export const init: ServerInit = async () => {
  dotenv.config();
  await connectDB();
};

// eslint-disable-next-line @typescript-eslint/unbound-method
export const handle: Handle = async ({ event, resolve }) => {
  // Detect language from request
  const language = detectLanguage(
    event.request.headers.get("accept-language"),
    event.cookies.get("language"),
  );
  await changeLanguage(language);

  // Mock user ID for now
  const userId = getRequiredEnvVar("MOCK_USER_ID");
  event.locals.user = { id: userId };

  const response = await resolve(event, {
    // Set lang attribute in HTML
    // This is also needed to initialize the language store on client side
    transformPageChunk: ({ html }) => html.replace("%lang%", language),
  });
  return response;
};
