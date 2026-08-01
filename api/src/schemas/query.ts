import { z } from "zod";

// Shared read-API query validation. Keyset pagination — `cursor` is opaque (see lib/cursor).
export const transactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  customerId: z.string().min(1).optional(), // used by the global GET /api/transactions
});

export const alertsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().min(1).optional(),
  status: z.enum(["OPEN", "TRIAGED", "RESOLVED", "FALSE_POSITIVE"]).optional(),
  risk: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
export type AlertsQuery = z.infer<typeof alertsQuerySchema>;
