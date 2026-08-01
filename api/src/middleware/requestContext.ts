import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { log, maskCustomerId } from "../lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Assigns a per-request id (X-Request-Id) and emits one structured log line per request.
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const start = Date.now();
  res.on("finish", () => {
    const bodyCustomerId =
      isRecord(req.body) && typeof req.body.customer_id === "string" ? req.body.customer_id : undefined;
    const customerId = req.params.id ?? bodyCustomerId;

    log("info", "http_request", {
      requestId,
      customerId_masked: maskCustomerId(customerId),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      latency_ms: Date.now() - start,
    });
  });

  next();
}
