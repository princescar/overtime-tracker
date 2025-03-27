import type { Handle, RequestEvent, ServerInit } from "@sveltejs/kit";
import dotenv from "dotenv";
import { connectDB } from "#/utils/db";
import { redis } from "#/utils/redis";
import { initOidc } from "#/utils/oidc";
import { detectLanguage } from "#/utils/i18n";
import { i18nStore } from "#/stores/i18n.svelte";
import { getRequiredEnvVar } from "./utils/env";
import { validateSessionToken } from "./utils/session";

export const init: ServerInit = async () => {
  dotenv.config();
  redis.connect();
  await Promise.all([connectDB(), initOidc()]);
};

const anonymousPaths = [
  "/login",
  "/auth/callback",
  "/auth/login",
  "/api/preferences/language",
  "/api/cron",
];

export const handle: Handle = async ({ event, resolve }) => {
  const language = await loadLanguage(event);

  const isAuthenticated = await authenticate(event);
  if (!isAuthenticated) {
    const { pathname } = new URL(event.request.url);
    if (!anonymousPaths.includes(pathname)) {
      const loginUrl = getRequiredEnvVar("APP_URL") + "/login";
      return Response.redirect(loginUrl, 303);
    }
  }

  const response = await resolve(event, {
    // Set lang attribute in HTML
    // This is also needed to initialize the language store on client side
    transformPageChunk: ({ html }) => html.replace("%lang%", language),
  });
  return response;
};

const loadLanguage = async ({ request, cookies }: RequestEvent) => {
  // Detect language from request
  const language = detectLanguage(request.headers.get("accept-language"), cookies.get("language"));
  await i18nStore.load(language);
  return language;
};

const authenticate = async ({ cookies, locals }: RequestEvent) => {
  const token = cookies.get("token");
  if (!token) {
    return false;
  }

  const session = await validateSessionToken(token);
  if (!session) {
    return false;
  }

  locals.user = { id: session.userId };

  cookies.set("token", token, {
    path: "/",
    expires: new Date(session.expiresAt),
    httpOnly: true,
    secure: true,
  });

  return true;
};
