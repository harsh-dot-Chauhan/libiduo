import { Redis } from "@upstash/redis";
import { env } from "./env";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in environment variables."
      );
    }
    _redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    return (getRedis() as never)[prop as keyof Redis];
  },
});
