import { redirect } from "@sveltejs/kit";
import { buildAuthorizationUrl } from "openid-client";
import { getAuthConfig } from "#/utils/auth";
import { getRequiredEnvVar } from "#/utils/env";
import type { RequestHandler } from "./$types";

// Redirect user to the OIDC server for authentication
export const GET: RequestHandler = ({ cookies }) => {
  const authConfig = getAuthConfig();
  const redirect_uri = getRequiredEnvVar("APP_URL") + "/auth/callback";
  const state = Math.random().toString(36).substring(2);

  const url = buildAuthorizationUrl(authConfig, {
    redirect_uri,
    state,
    scope: "openid",
  });
  console.log("Redirect to auth URL with state", url.href, state);

  cookies.set("auth_state", state, { path: "/", maxAge: 5 * 60, secure: true, httpOnly: true });
  redirect(302, url);
};
