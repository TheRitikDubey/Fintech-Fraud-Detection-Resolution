import type { Request, Response, NextFunction } from "express";
import { take } from "../lib/rateLimiter";
import { rateLimitBlockTotal } from "../metrics/registry";

// Per-client rate limit (5 req/s by default). Client = X-API-Key, else remote IP.
export async function rateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const client = req.header("X-API-Key") ?? req.ip ?? "anonymous";
  const { allowed, retryAfter } = await take(client);

  if (!allowed) {
    rateLimitBlockTotal.inc();
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({ error: "Too Many Requests", retryAfter });
    return;
  }
  next();
}
