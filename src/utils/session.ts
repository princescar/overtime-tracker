import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { redis } from "./redis";
import { getRequiredNumericEnvVar } from "./env";

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
}

export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
};

export const createSession = async (token: string, userId: string): Promise<Session> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiryHours = getRequiredNumericEnvVar("SESSION_EXPIRY_HOURS");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * expiryHours);
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: +expiresAt,
  };
  await redis.setWithExpiry(`session:${session.id}`, session, expiresAt);
  return session;
};

export const validateSessionToken = async (token: string): Promise<Session | null> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = await redis.get<Session>(`session:${sessionId}`);
  if (session === null) {
    return null;
  }

  if (Date.now() >= +session.expiresAt) {
    await redis.delete(`session:${sessionId}`);
    return null;
  }

  // Renew session if past half of expiry
  const expiryHours = getRequiredNumericEnvVar("SESSION_EXPIRY_HOURS");
  if (+session.expiresAt - Date.now() < expiryHours / 2) {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * expiryHours);
    session.expiresAt = +newExpiresAt;
    await redis.setWithExpiry(`session:${session.id}`, session, newExpiresAt);
  }

  return session;
};

export const invalidateSession = async (sessionId: string): Promise<void> => {
  await redis.delete(`session:${sessionId}`);
};
