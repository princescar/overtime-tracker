import type { Handle, ServerInit } from "@sveltejs/kit";
import dotenv from "dotenv";
import { connectDB } from "#/utils/db";
import { initAuth, tryGetUserFromRequest } from "#/utils/auth";
import { detectLanguage } from "#/utils/i18n";
import { i18nStore } from "#/stores/i18n.svelte";
import { getRequiredEnvVar } from "./utils/env";

export const init: ServerInit = async () => {
  dotenv.config();
  await Promise.all([connectDB(), initAuth()]);
};

// eslint-disable-next-line @typescript-eslint/unbound-method
export const handle: Handle = async ({ event, resolve }) => {
  // Detect language from request
  const language = detectLanguage(
    event.request.headers.get("accept-language"),
    event.cookies.get("language"),
  );
  await i18nStore.load(language);

  // Redirect to login page if not authenticated
  const user = await tryGetUserFromRequest(event);
  const { pathname } = new URL(event.request.url);
  if (!user && !(pathname.startsWith("/auth") || pathname === "/api/cron")) {
    const loginUrl = getRequiredEnvVar("APP_URL") + "/auth/login";
    return Response.redirect(loginUrl);
  }
  event.locals.user = user as { id: string };

  const response = await resolve(event, {
    // Set lang attribute in HTML
    // This is also needed to initialize the language store on client side
    transformPageChunk: ({ html }) => html.replace("%lang%", language),
  });
  return response;
};
