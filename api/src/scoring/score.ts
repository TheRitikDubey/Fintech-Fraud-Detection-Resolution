import { WEIGHTS } from "./types";
import type { Reason, ScorableTxn, ScoreResult, Severity } from "./types";

// ── helpers ────────────────────────────────────────────────────────────────
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function money(cents: bigint): string {
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stddev(values: number[], mu: number): number {
  const variance = values.reduce((sum, v) => sum + (v - mu) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// circular distance between two hours-of-day (0–23)
function hourDistance(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 24 - d);
}

function severityFor(score: number): Severity {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

// ── signals (pure) ─────────────────────────────────────────────────────────
// Each returns a Reason when it meaningfully contributes, else null.

function amountZScore(txn: ScorableTxn, history: ScorableTxn[]): Reason | null {
  const amounts = history.map((h) => Number(h.amountCents));
  const mu = mean(amounts);
  const sd = stddev(amounts, mu);
  const amount = Number(txn.amountCents);

  if (sd === 0) {
    if (amount <= mu) return null;
    return {
      code: "AMOUNT_ZSCORE",
      detail: `Amount ${money(txn.amountCents)} exceeds a previously constant spend of ${money(BigInt(Math.round(mu)))}`,
      points: WEIGHTS.AMOUNT_ZSCORE * 0.5,
      weight: WEIGHTS.AMOUNT_ZSCORE,
    };
  }

  const z = (amount - mu) / sd;
  if (z <= 1) return null; // only unusually high spend is anomalous
  const points = Math.min(z / 4, 1) * WEIGHTS.AMOUNT_ZSCORE;
  return {
    code: "AMOUNT_ZSCORE",
    detail: `Amount ${money(txn.amountCents)} is ${z.toFixed(1)}σ above the customer mean ${money(BigInt(Math.round(mu)))}`,
    points,
    weight: WEIGHTS.AMOUNT_ZSCORE,
  };
}

function newMerchant(txn: ScorableTxn, history: ScorableTxn[]): Reason | null {
  if (!txn.merchant) return null;
  const seen = new Set(history.map((h) => h.merchant.toLowerCase()));
  if (seen.has(txn.merchant.toLowerCase())) return null;
  return {
    code: "NEW_MERCHANT",
    detail: `First transaction at "${txn.merchant}" for this customer`,
    points: WEIGHTS.NEW_MERCHANT,
    weight: WEIGHTS.NEW_MERCHANT,
  };
}

function newCountry(txn: ScorableTxn, history: ScorableTxn[]): Reason | null {
  if (!txn.country) return null;
  const seen = new Set(history.map((h) => h.country.toUpperCase()));
  if (seen.has(txn.country.toUpperCase())) return null;
  return {
    code: "NEW_COUNTRY",
    detail: `First transaction from country "${txn.country}" for this customer`,
    points: WEIGHTS.NEW_COUNTRY,
    weight: WEIGHTS.NEW_COUNTRY,
  };
}

function velocity(txn: ScorableTxn, history: ScorableTxn[]): Reason | null {
  const t = txn.ts.getTime();
  const c1h = history.filter((h) => t - h.ts.getTime() <= HOUR_MS).length;
  const c24h = history.filter((h) => t - h.ts.getTime() <= DAY_MS).length;
  const points = Math.min(c1h / 5, 1) * 8 + Math.min(c24h / 20, 1) * 7;
  if (points < 0.5) return null;
  return {
    code: "VELOCITY",
    detail: `${c1h} transaction(s) in the last hour, ${c24h} in the last 24h`,
    points,
    weight: WEIGHTS.VELOCITY,
  };
}

function mccRarity(txn: ScorableTxn, history: ScorableTxn[]): Reason | null {
  if (!txn.mcc) return null;
  const same = history.filter((h) => h.mcc === txn.mcc).length;
  const rarity = 1 - same / history.length;
  const points = rarity * WEIGHTS.MCC_RARITY;
  if (points < 0.5) return null;
  return {
    code: "MCC_RARITY",
    detail: `MCC ${txn.mcc} appears in ${Math.round((same / history.length) * 100)}% of recent history`,
    points,
    weight: WEIGHTS.MCC_RARITY,
  };
}

function timeOfDay(txn: ScorableTxn, history: ScorableTxn[]): Reason | null {
  const hour = txn.ts.getUTCHours();
  const nearby = history.filter((h) => hourDistance(h.ts.getUTCHours(), hour) <= 2).length;
  const frac = nearby / history.length;
  const points = (1 - frac) * WEIGHTS.TIME_OF_DAY;
  if (points < 0.5) return null;
  return {
    code: "TIME_OF_DAY",
    detail: `Transaction at ${String(hour).padStart(2, "0")}:00 UTC; only ${Math.round(frac * 100)}% of history occurs near this hour`,
    points,
    weight: WEIGHTS.TIME_OF_DAY,
  };
}

/**
 * Score a transaction against the customer's prior behaviour. Pure and deterministic —
 * this is the swappable entry point. With no history we can't assess deviation, so the
 * score is 0 (no false alerts on a customer's first transaction).
 */
export function scoreTransaction(txn: ScorableTxn, history: ScorableTxn[]): ScoreResult {
  if (history.length === 0) {
    return {
      score: 0,
      severity: "LOW",
      reasons: [
        {
          code: "NO_HISTORY",
          detail: "No prior history for this customer; deviation cannot be assessed",
          points: 0,
          weight: 0,
        },
      ],
    };
  }

  const reasons: Reason[] = [];
  for (const signal of [amountZScore, newMerchant, newCountry, velocity, mccRarity, timeOfDay]) {
    const reason = signal(txn, history);
    if (reason) reasons.push(reason);
  }

  const score = Math.round(Math.min(100, reasons.reduce((sum, r) => sum + r.points, 0)));
  return { score, severity: severityFor(score), reasons };
}
