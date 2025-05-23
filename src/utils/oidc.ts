import { type Configuration, discovery, fetchUserInfo, skipSubjectCheck } from "openid-client";
import { getRequiredEnvVar } from "./env";

let config: Configuration | null = null;

export const initOidc = async () => {
  const server = getRequiredEnvVar("OIDC_SERVER_URL");
  const clientId = getRequiredEnvVar("OIDC_CLIENT_ID");
  const clientSecret = getRequiredEnvVar("OIDC_CLIENT_SECRET");

  config = await discovery(new URL(server), clientId, clientSecret);
  console.log("Oidc initialized", server);
};

export const getOidcConfig = () => {
  if (!config) {
    throw new Error("Oidc not initialized");
  }

  return config;
};

export const validateAccessToken = async (token: string) => {
  const config = getOidcConfig();
  try {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return await fetchUserInfo(config, token, skipSubjectCheck);
  } catch (error) {
    console.error("Error validating access token", error);
    return null;
  }
};
