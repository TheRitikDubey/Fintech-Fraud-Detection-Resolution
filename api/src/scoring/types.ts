// Rank-order scoring — shared types and signal weights.
// The score is the sum of each signal's contributed points, clamped to [0, 100].

export type ReasonCode =
  | "AMOUNT_ZSCORE"
  | "NEW_MERCHANT"
  | "NEW_COUNTRY"
  | "VELOCITY"
  | "MCC_RARITY"
  | "TIME_OF_DAY"
  | "NO_HISTORY";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Max points each signal can contribute. Sums to 100.
export const WEIGHTS = {
  AMOUNT_ZSCORE: 30,
  NEW_COUNTRY: 20,
  NEW_MERCHANT: 15,
  VELOCITY: 15,
  MCC_RARITY: 10,
  TIME_OF_DAY: 10,
} as const;

export interface Reason {
  code: ReasonCode;
  detail: string; // human-readable explanation shown in the triage UI
  points: number; // contribution to the final score
  weight: number; // max this signal could have contributed
}

// Minimal shape the scorer needs from a transaction (new or historical).
export interface ScorableTxn {
  amountCents: bigint;
  merchant: string;
  country: string;
  mcc: string;
  ts: Date;
}

export interface ScoreResult {
  score: number; // 0–100
  severity: Severity;
  reasons: Reason[];
}
