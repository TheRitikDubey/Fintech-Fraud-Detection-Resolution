import { getRedis } from "../redis/client";
import { env } from "../config/env";

// Token bucket: capacity = RATE_LIMIT_RPS, refilled at RATE_LIMIT_RPS tokens/second.
const CAPACITY = env.RATE_LIMIT_RPS;
const REFILL_PER_SEC = env.RATE_LIMIT_RPS;

export interface RateResult {
  allowed: boolean;
  retryAfter: number; // seconds until the next token is available
}

// Atomic Redis token bucket. Returns [allowed (0/1), retryAfter seconds].
const LUA = `
local bucket = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(bucket[1])
local ts = tonumber(bucket[2])
local capacity = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
if tokens == nil then tokens = capacity; ts = now end
local elapsed = math.max(0, now - ts) / 1000.0
tokens = math.min(capacity, tokens + elapsed * rate)
local allowed = 0
local retry = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
else
  retry = math.ceil((1 - tokens) / rate)
end
redis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', KEYS[1], 60000)
return { allowed, retry }
`;

const memory = new Map<string, { tokens: number; ts: number }>();

function takeMemory(key: string): RateResult {
  const now = Date.now();
  const bucket = memory.get(key) ?? { tokens: CAPACITY, ts: now };
  const elapsed = Math.max(0, now - bucket.ts) / 1000;
  let tokens = Math.min(CAPACITY, bucket.tokens + elapsed * REFILL_PER_SEC);

  let allowed = false;
  let retryAfter = 0;
  if (tokens >= 1) {
    tokens -= 1;
    allowed = true;
  } else {
    retryAfter = Math.ceil((1 - tokens) / REFILL_PER_SEC);
  }
  memory.set(key, { tokens, ts: now });
  return { allowed, retryAfter };
}

export async function take(key: string): Promise<RateResult> {
  const redis = getRedis();
  if (redis) {
    try {
      const result = (await redis.eval(LUA, 1, `rl:${key}`, CAPACITY, REFILL_PER_SEC, Date.now())) as [
        number,
        number,
      ];
      return { allowed: result[0] === 1, retryAfter: result[1] };
    } catch {
      // fall through to in-memory
    }
  }
  return takeMemory(key);
}
