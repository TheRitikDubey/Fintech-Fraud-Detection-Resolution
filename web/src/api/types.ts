// API DTOs — mirror the serializers in api/src/lib/dto.ts. Money is a string (BigInt cents).

export type AlertStatus = "OPEN" | "TRIAGED" | "RESOLVED" | "FALSE_POSITIVE";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

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
  severity: Severity;
  status: AlertStatus;
  reasons: AlertReason[];
  createdAt: string;
  updatedAt: string;
  transaction?: TransactionDTO;
}

export interface TransactionDetailDTO extends TransactionDTO {
  alert: AlertDTO | null;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}

export interface MerchantStat {
  merchant: string;
  count: number;
  totalCents: string;
}

export interface CategoryStat {
  mcc: string;
  count: number;
  totalCents: string;
}

export interface MonthlyTrendPoint {
  month: string; // YYYY-MM
  count: number;
  totalCents: string;
}

export interface CustomerSummaryDTO {
  customerId: string;
  topMerchants: MerchantStat[];
  topCategories: CategoryStat[];
  monthlyTrend: MonthlyTrendPoint[];
  anomalies: AlertDTO[];
}
