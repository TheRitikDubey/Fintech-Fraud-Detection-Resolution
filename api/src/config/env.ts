import "dotenv/config";
import { z } from "zod";

// Centralised, validated environment. Importing this module loads `.env` (via
// dotenv/config) before anything else reads process.env — including the Prisma client.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1).optional(),
  PORT: z.coerce.number().int().positive().default(8000),
  API_KEY: z.string().min(1).default("dev-local-key"), // action endpoints; override in api/.env
  JWT_SECRET: z.string().min(1).default("dev-jwt-secret-change-me"), // auth token signing
  JWT_EXPIRES_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 7), // 7 days
  SCORE_THRESHOLD: z.coerce.number().min(0).max(100).default(70),
  HISTORY_DAYS: z.coerce.number().int().positive().default(90),
  RATE_LIMIT_RPS: z.coerce.number().int().positive().default(5),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
