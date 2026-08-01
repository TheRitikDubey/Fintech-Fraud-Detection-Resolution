import { Registry, Histogram, Counter, collectDefaultMetrics } from "prom-client";

// Prometheus registry + the metrics the brief requires.
export const register = new Registry();
collectDefaultMetrics({ register });

export const httpLatency = new Histogram({
  name: "api_request_latency_ms",
  help: "API request latency in milliseconds",
  labelNames: ["method", "status"] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500],
  registers: [register],
});

export const toolCallTotal = new Counter({
  name: "tool_call_total",
  help: "Total action/tool calls by tool",
  labelNames: ["tool"] as const,
  registers: [register],
});

export const rateLimitBlockTotal = new Counter({
  name: "rate_limit_block_total",
  help: "Total requests blocked by the rate limiter",
  registers: [register],
});
