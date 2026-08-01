import type { Request, Response, NextFunction } from "express";
import { httpLatency } from "../metrics/registry";

// Observe per-request latency into the api_request_latency_ms histogram.
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    httpLatency.labels(req.method, String(res.statusCode)).observe(ms);
  });
  next();
}
