import type { Handle, RequestEvent, ServerInit } from "@sveltejs/kit";
import dotenv from "dotenv";
import { connectDB } from "#/utils/db";
import { initOidc, validateAccessToken } from "#/utils/oidc";
import { detectLanguage } from "#/utils/i18n";
import { i18nStore } from "#/stores/i18n.svelte";
import { getRequiredEnvVar } from "./utils/env";
import { UserService } from "./services/user.service";

const userService = new UserService();

export const init: ServerInit = async () => {
  dotenv.config();
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

  const oidcUser = await validateAccessToken(token);
  if (!oidcUser) {
    return false;
  }

  const user = await userService.getUserByOidcId(oidcUser.sub);
  if (!user) {
    return false;
  }

  locals.user = user;
  cookies.set("token", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: true,
  });

  return true;
};
