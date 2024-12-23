import { authorizationCodeGrant } from "openid-client";
import { getAuthConfig } from "#/utils/auth";
import { getRequiredEnvVar } from "#/utils/env";
import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

// Redirect user to the OIDC server for authentication
export const GET: RequestHandler = async ({ request, cookies }) => {
  const authConfig = getAuthConfig();
  const state = cookies.get("auth_state");
  const { access_token, expires_in } = await authorizationCodeGrant(authConfig, request, {
    expectedState: state,
  });

  if (!access_token) {
    throw new Error("No id token received");
  }

  cookies.delete("auth_state", { path: "/" });
  cookies.set("token", access_token, {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: expires_in,
  });

  const returnTo = getRequiredEnvVar("APP_URL");
  redirect(302, returnTo);
};
