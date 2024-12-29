import { authorizationCodeGrant } from "openid-client";
import { redirect } from "@sveltejs/kit";
import { UserService } from "#/services/user.service";
import { getOidcConfig } from "#/utils/oidc";
import { getRequiredEnvVar } from "#/utils/env";
import { createSession, generateSessionToken } from "#/utils/session";
import type { RequestHandler } from "./$types";

const userService = new UserService();

// Redirect user to the OIDC server for authentication
export const GET: RequestHandler = async ({ request, cookies }) => {
  const oidcConfig = getOidcConfig();

  const state = cookies.get("oidc_state");
  cookies.delete("oidc_state", { path: "/" }); // State can be used only once

  const tokenSet = await authorizationCodeGrant(oidcConfig, request, { expectedState: state });
  const oidcId = tokenSet.claims()?.sub;
  if (!oidcId) {
    throw new Error("No OIDC id received");
  }

  const user = await userService.getUserByOidcId(oidcId);
  if (!user) {
    throw new Error(`Cannot find user with OIDC ID ${oidcId}`);
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);

  cookies.set("token", sessionToken, {
    path: "/",
    expires: new Date(session.expiresAt),
    httpOnly: true,
    secure: true,
  });

  const returnTo = getRequiredEnvVar("APP_URL");
  redirect(302, returnTo);
};
