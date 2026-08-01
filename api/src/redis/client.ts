import Redis from "ioredis";
import { env } from "../config/env";

// Lazily-created Redis client. Returns null when REDIS_URL is unset so callers can
// transparently fall back to an in-memory store (see lib/idempotency.ts). When the URL
// is set but Redis is unreachable, commands reject quickly (enableOfflineQueue: false)
// and callers fall back rather than hang.
let client: Redis | null = null;
let warned = false;

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    });
    client.on("error", (err) => {
      if (!warned) {
        console.warn(`[redis] unavailable, using in-memory fallback: ${err.message}`);
        warned = true;
      }
    });
  }
  return client;
}
