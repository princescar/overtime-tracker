import { authorizationCodeGrant } from "openid-client";
import { redirect } from "@sveltejs/kit";
import { UserService } from "#/services/user.service";
import { getOidcConfig } from "#/utils/oidc";
import { getBooleanEnvVar, getRequiredEnvVar } from "#/utils/env";
import type { RequestHandler } from "./$types";

const refreshUser = getBooleanEnvVar("OIDC_REFRESH_USER", false);

const userService = new UserService();

// Redirect user to the OIDC server for authentication
export const GET: RequestHandler = async ({ request, cookies }) => {
  const oidcConfig = getOidcConfig();

  const state = cookies.get("oidc_state");

  const tokenSet = await authorizationCodeGrant(oidcConfig, request, { expectedState: state });
  const claims = tokenSet.claims();
  if (!claims) {
    throw new Error("No claims received");
  }

  const { sub, email, name } = claims;
  if (!sub) {
    throw new Error("No ID received from oidc");
  }

  let user = await userService.getUserByOidcId(sub);
  if (!user && email) {
    // Try to find user by email to handle OIDC provider transition
    user = await userService.getUserByEmail(email as string);
  }

  if (!user) {
    throw new Error("User not found");
  }

  if (refreshUser) {
    await userService.modifyUser(user.id, {
      oidcId: sub,
      email: email as string | undefined,
      name: name as string | undefined,
    });
  }

  cookies.delete("oidc_state", { path: "/" });
  cookies.set("token", tokenSet.access_token, {
    path: "/",
    maxAge: tokenSet.expiresIn() ?? 3600,
    httpOnly: true,
    secure: true,
  });

  const returnTo = getRequiredEnvVar("APP_URL");
  redirect(303, returnTo);
};
