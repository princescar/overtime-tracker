import { Redis } from "ioredis";
import { getRequiredEnvVar } from "./env";

class RedisUtil {
  #redis: Redis | null = null;
  private get instance() {
    if (!this.#redis) {
      throw new Error("Redis not connected");
    }
    return this.#redis;
  }

  connect() {
    if (!this.#redis) {
      const uri = getRequiredEnvVar("REDIS_URI");
      this.#redis = new Redis(uri);
      console.log("Redis connected successfully");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const str = await this.instance.get(key);
    return str ? (JSON.parse(str) as T) : null;
  }

  async set(key: string, value: unknown) {
    await this.instance.set(key, JSON.stringify(value));
  }

  async setWithTtl(key: string, value: unknown, secondsToLive: number) {
    await this.instance.set(key, JSON.stringify(value), "EX", secondsToLive);
  }

  async setWithExpiry(key: string, value: unknown, expiresAt: Date) {
    await this.instance.set(key, JSON.stringify(value), "EXAT", Math.floor(+expiresAt / 1000));
  }

  async delete(key: string) {
    await this.instance.del(key);
  }
}

export const redis = new RedisUtil();
