import { z } from "zod";

// Treat empty strings (common in CSV cells) as "absent" for optional fields.
const emptyToUndef = (v: unknown): unknown =>
  v === "" || v === null || v === undefined ? undefined : v;

// A single ingest record. Accepts either `amount_cents` (integer cents, preferred) or
// `amount` (major currency units); normalization folds them into integer cents.
export const transactionInputSchema = z
  .object({
    customer_id: z.string().trim().min(1, "customer_id is required"),
    id: z.string().trim().min(1, "id is required"),
    amount_cents: z.preprocess(emptyToUndef, z.coerce.number().int("amount_cents must be an integer").optional()),
    amount: z.preprocess(emptyToUndef, z.coerce.number().optional()),
    currency: z.string().trim().min(1, "currency is required"),
    mcc: z.preprocess(emptyToUndef, z.string().trim().optional()),
    merchant: z.string().trim().min(1, "merchant is required"),
    country: z.string().trim().min(1, "country is required"),
    city: z.preprocess(emptyToUndef, z.string().trim().optional()),
    status: z.preprocess(emptyToUndef, z.string().trim().optional()),
    ts: z.preprocess(emptyToUndef, z.coerce.date().optional()),
  })
  .refine((d) => d.amount_cents !== undefined || d.amount !== undefined, {
    message: "Either amount_cents or amount is required",
    path: ["amount_cents"],
  });

export const transactionBatchSchema = z
  .array(transactionInputSchema)
  .min(1, "No transactions provided");

export type TransactionInput = z.infer<typeof transactionInputSchema>;

export interface NormalizedTxn {
  customerId: string;
  txnId: string;
  amountCents: bigint;
  currency: string;
  status: string;
  mcc: string;
  merchant: string;
  country: string;
  city: string;
  ts: Date;
}

export function normalizeTxn(input: TransactionInput): NormalizedTxn {
  // refine guarantees one of the two is present; `?? 0` keeps the type narrow without a cast.
  const cents = input.amount_cents ?? Math.round((input.amount ?? 0) * 100);
  return {
    customerId: input.customer_id,
    txnId: input.id,
    amountCents: BigInt(cents),
    currency: input.currency,
    status: input.status && input.status.length > 0 ? input.status : "SUCCESS",
    mcc: input.mcc ?? "",
    merchant: input.merchant,
    country: input.country,
    city: input.city ?? "",
    ts: input.ts ?? new Date(),
  };
}
