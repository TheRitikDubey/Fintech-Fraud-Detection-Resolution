import crypto from "node:crypto";
import { getRedis } from "../redis/client";

// A previously-served response, keyed by Idempotency-Key. `requestHash` lets us detect
// the same key being reused with a different payload (an error, not a replay).
export interface StoredResponse {
  requestHash: string;
  status: number;
  body: unknown;
}

const TTL_SECONDS = 60 * 60 * 24; // 24h
const REDIS_PREFIX = "idem:";

// In-memory fallback used when Redis is unset/unreachable. Entries lazily expire on read.
const memory = new Map<string, { value: StoredResponse; expiresAt: number }>();

function memGet(key: string): StoredResponse | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return hit.value;
}

function memSet(key: string, value: StoredResponse): void {
  memory.set(key, { value, expiresAt: Date.now() + TTL_SECONDS * 1000 });
}

export function hashRequest(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function getIdempotentResponse(key: string): Promise<StoredResponse | null> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get(`${REDIS_PREFIX}${key}`);
      return raw ? (JSON.parse(raw) as StoredResponse) : null;
    } catch {
      // fall through to in-memory
    }
  }
  return memGet(key);
}

export async function saveIdempotentResponse(key: string, value: StoredResponse): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(`${REDIS_PREFIX}${key}`, JSON.stringify(value), "EX", TTL_SECONDS);
      return;
    } catch {
      // fall through to in-memory
    }
  }
  memSet(key, value);
}
