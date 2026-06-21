import type { Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { env } from "../config/env";
import { scoreTransaction } from "./score";
import type { ScorableTxn } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_LIMIT = 500; // cap rows fed into the baseline

// A persisted transaction we want to score. (Prisma's Transaction is assignable to this.)
export interface ScorableRecord extends ScorableTxn {
  id: string;
  customerId: string;
}

/**
 * Score each newly-ingested transaction against its prior HISTORY_DAYS of history and
 * upsert an Alert when the score meets the threshold. Runs synchronously inside the
 * ingestion request for now; the per-transaction shape makes it trivial to move behind a
 * Redis-backed worker queue later. Returns the number of alerts created/updated.
 */
export async function scoreAndCreateAlerts(txns: ScorableRecord[]): Promise<number> {
  let alerts = 0;

  for (const txn of txns) {
    const windowStart = new Date(txn.ts.getTime() - env.HISTORY_DAYS * DAY_MS);

    const history = await prisma.transaction.findMany({
      where: { customerId: txn.customerId, ts: { lt: txn.ts, gte: windowStart } },
      orderBy: { ts: "desc" },
      take: HISTORY_LIMIT,
      select: { amountCents: true, merchant: true, country: true, mcc: true, ts: true },
    });

    const result = scoreTransaction(txn, history);
    if (result.score < env.SCORE_THRESHOLD) continue;

    // reasons is plain JSON (strings/numbers only) — safe to store as JSONB.
    const reasons = result.reasons as unknown as Prisma.InputJsonValue;

    await prisma.alert.upsert({
      where: { transactionId: txn.id },
      // Preserve an agent's triage status on re-score; only refresh the scoring fields.
      update: { score: result.score, severity: result.severity, reasons },
      create: {
        transactionId: txn.id,
        customerId: txn.customerId,
        score: result.score,
        severity: result.severity,
        reasons,
      },
    });
    alerts += 1;
  }

  return alerts;
}
