import type { Transaction, Alert } from "@prisma/client";

// Serializers that make Prisma rows JSON-safe (BigInt -> string) and stable for the API.

export interface TransactionDTO {
  id: string;
  txnId: string;
  customerId: string;
  amountCents: string;
  currency: string;
  mcc: string;
  merchant: string;
  country: string;
  city: string;
  status: string;
  ts: string;
  createdAt: string;
}

export function toTransactionDTO(t: Transaction): TransactionDTO {
  return {
    id: t.id,
    txnId: t.txnId,
    customerId: t.customerId,
    amountCents: t.amountCents.toString(),
    currency: t.currency,
    mcc: t.mcc,
    merchant: t.merchant,
    country: t.country,
    city: t.city,
    status: t.status,
    ts: t.ts.toISOString(),
    createdAt: t.createdAt.toISOString(),
  };
}

export interface AlertReason {
  code: string;
  detail: string;
  points: number;
  weight: number;
}

export interface AlertDTO {
  id: string;
  transactionId: string;
  customerId: string;
  score: number;
  severity: string;
  status: string;
  reasons: AlertReason[];
  createdAt: string;
  updatedAt: string;
  transaction?: TransactionDTO;
}

export function toAlertDTO(a: Alert & { transaction?: Transaction }): AlertDTO {
  return {
    id: a.id,
    transactionId: a.transactionId,
    customerId: a.customerId,
    score: a.score,
    severity: a.severity,
    status: a.status,
    reasons: a.reasons as unknown as AlertReason[],
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    transaction: a.transaction ? toTransactionDTO(a.transaction) : undefined,
  };
}
