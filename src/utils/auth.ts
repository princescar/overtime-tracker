import { type Configuration, discovery, fetchUserInfo, skipSubjectCheck } from "openid-client";
import type { RequestEvent } from "@sveltejs/kit";
import { UserService } from "#/services/user.service";
import { getRequiredEnvVar } from "./env";

const userService = new UserService();

let config: Configuration | null = null;

export const initAuth = async () => {
  const server = getRequiredEnvVar("OIDC_SERVER_URL");
  const clientId = getRequiredEnvVar("OIDC_CLIENT_ID");
  const clientSecret = getRequiredEnvVar("OIDC_CLIENT_SECRET");

  config = await discovery(new URL(server), clientId, clientSecret);
  console.log("OIDC initialized", server, clientId);
};

export const getAuthConfig = () => {
  if (!config) {
    throw new Error("OIDC not initialized");
  }

  return config;
};

export const tryGetUserFromRequest = async (event: RequestEvent) => {
  const token = event.cookies.get("token");

  if (!token) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const oidcUser = await fetchUserInfo(getAuthConfig(), token, skipSubjectCheck);
  const dbUser = await userService.getUserByOidcId(oidcUser.sub);
  return { id: dbUser.id };
};
