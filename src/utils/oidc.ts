import { type Configuration, discovery } from "openid-client";
import { getRequiredEnvVar } from "./env";

let config: Configuration | null = null;

export const initOidc = async () => {
  const server = getRequiredEnvVar("OIDC_SERVER_URL");
  const clientId = getRequiredEnvVar("OIDC_CLIENT_ID");
  const clientSecret = getRequiredEnvVar("OIDC_CLIENT_SECRET");

  config = await discovery(new URL(server), clientId, clientSecret);
  console.log("OIDC initialized", server, clientId);
};

export const getOidcConfig = () => {
  if (!config) {
    throw new Error("OIDC not initialized");
  }

  return config;
};