import { Request, Response } from "express";
import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { transactionBatchSchema, normalizeTxn } from "../schemas/transaction";
import { transactionsQuerySchema } from "../schemas/query";
import { decodeCursor, encodeCursor } from "../lib/cursor";
import { toTransactionDTO, toAlertDTO } from "../lib/dto";
import { scoreAndCreateAlerts } from "../scoring/scoreAndAlert";

interface TransactionPayload {
  customer_id?: string;
  id?: string;
  amount_cents?: number | string;
  amount?: number | string;
  currency?: string;
  status?: string;
  ts?: string;
  mcc?: string;
  merchant?: string;
  country?: string;
  city?: string;
}

interface UploadedFileLike {
  data: Buffer;
}

interface UploadedFileMap {
  [fieldName: string]: UploadedFileLike | UploadedFileLike[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === "\"") {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const parseCsvTransactions = (csvContent: string): TransactionPayload[] => {
  const normalizedCsv = csvContent.replace(/^\uFEFF/, "");
  const lines = normalizedCsv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one data row");
  }

  const headers = parseCsvLine(lines[0]).map((column) => column.trim().toLowerCase());
  const requiredHeaders = ["id", "customer_id", "currency", "mcc", "merchant", "country", "city"];

  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      throw new Error(`CSV missing required column: ${requiredHeader}`);
    }
  }

  if (!headers.includes("amount") && !headers.includes("amount_cents")) {
    throw new Error("CSV missing required column: amount");
  }

  const transactions: TransactionPayload[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};

    for (let i = 0; i < headers.length; i += 1) {
      row[headers[i]] = (values[i] ?? "").trim();
    }

    transactions.push({
      id: row.id,
      customer_id: row.customer_id,
      amount: row.amount || row.amount_cents,
      amount_cents: row.amount_cents || row.amount,
      currency: row.currency,
      status: row.status,
      ts: row.ts,
      mcc: row.mcc,
      merchant: row.merchant,
      country: row.country,
      city: row.city
    });
  }

  return transactions;
};

const getCsvContentFromRequest = (req: Request): string | null => {
  const fileContainer = (req as Request & { files?: UploadedFileMap | null }).files;

  if (fileContainer && Object.keys(fileContainer).length > 0) {
    const preferredKeys = ["file", "csv", "transactions"];

    for (const key of preferredKeys) {
      const value = fileContainer[key];
      if (!value) {
        continue;
      }
      const file = Array.isArray(value) ? value[0] : value;
      if (file?.data) {
        return file.data.toString("utf-8");
      }
    }

    for (const value of Object.values(fileContainer)) {
      const file = Array.isArray(value) ? value[0] : value;
      if (file?.data) {
        return file.data.toString("utf-8");
      }
    }
  }

  if (typeof req.body === "string" && req.body.trim().length > 0) {
    return req.body;
  }

  if (isRecord(req.body) && typeof req.body.csv === "string" && req.body.csv.trim().length > 0) {
    return req.body.csv;
  }

  return null;
};

const getJsonTransactionsFromRequest = (req: Request): TransactionPayload[] | null => {
  if (Array.isArray(req.body)) {
    return req.body as TransactionPayload[];
  }

  if (isRecord(req.body) && Array.isArray(req.body.transactions)) {
    return req.body.transactions as TransactionPayload[];
  }

  if (isRecord(req.body) && typeof req.body.transactions === "string") {
    try {
      const parsed = JSON.parse(req.body.transactions);
      return Array.isArray(parsed) ? (parsed as TransactionPayload[]) : null;
    } catch {
      return null;
    }
  }

  return null;
};

export const ingestTransactions = async (req: Request, res: Response) => {
  try {
    const csvContent = getCsvContentFromRequest(req);
    let rawRecords: TransactionPayload[] | null;

    // Try parsing CSV first if content is available, otherwise fall back to JSON parsing.
    try {
      rawRecords = csvContent
        ? parseCsvTransactions(csvContent)
        : getJsonTransactionsFromRequest(req);
    } catch (parseError) {
      return res.status(400).json({
        error: parseError instanceof Error ? parseError.message : "Invalid CSV format"
      });
    }

    if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
      return res.status(400).json({
        error: "Provide transactions as a JSON array/object or upload a CSV file"
      });
    }

    // Validate the whole batch with Zod; reject on the first failures (capped for readability).
    const parsed = transactionBatchSchema.safeParse(rawRecords);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Transaction validation failed",
        issues: parsed.error.issues.slice(0, 20).map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const normalized = parsed.data.map(normalizeTxn);

    // FK now requires the customer to exist. Upsert a stub for any unknown id so ingestion
    // never fails on a missing customer; real customer details arrive via the Step 9 seed.
    const customerIds = [...new Set(normalized.map((txn) => txn.customerId))];
    await prisma.$transaction(
      customerIds.map((id) =>
        prisma.customer.upsert({
          where: { id },
          update: {},
          create: { id, name: id, email: `${id}@placeholder.local` }
        })
      )
    );

    // Dedupe upsert on (customerId, txnId).
    const results = await prisma.$transaction(
      normalized.map((txn) =>
        prisma.transaction.upsert({
          where: {
            customerId_txnId: { customerId: txn.customerId, txnId: txn.txnId }
          },
          update: {
            amountCents: txn.amountCents,
            currency: txn.currency,
            status: txn.status,
            mcc: txn.mcc,
            merchant: txn.merchant,
            country: txn.country,
            city: txn.city,
            ts: txn.ts
          },
          create: {
            customerId: txn.customerId,
            txnId: txn.txnId,
            amountCents: txn.amountCents,
            currency: txn.currency,
            status: txn.status,
            mcc: txn.mcc,
            merchant: txn.merchant,
            country: txn.country,
            city: txn.city,
            ts: txn.ts
          }
        })
      )
    );

    // Score newly-upserted transactions and raise alerts. Ingestion has already persisted
    // the data, so a scoring failure must not fail the request — log and continue.
    try {
      await scoreAndCreateAlerts(results);
    } catch (scoringError) {
      console.error("Scoring/alerting failed (transactions were still ingested):", scoringError);
    }

    const requestId = crypto.randomUUID();
    return res.json({ accepted: true, count: results.length, requestId });

  } catch (error) {
    console.log("Error details:", error);
    console.error("Error ingesting transactions:", error);
    res.status(500).json({ 
      error: "Internal server error while processing transactions" 
    });
  }
};

/**
 * Keyset-paginated transactions. Drives both:
 *   GET /api/customer/:id/transactions  (customerId from route param)
 *   GET /api/transactions               (optional ?customerId= filter)
 * Orders by (ts DESC, id DESC) using the (customerId, ts DESC) index; returns
 * { items, nextCursor }. nextCursor is null on the last page.
 */
export const listTransactions = async (req: Request, res: Response) => {
  try {
    const parsed = transactionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    const { limit, cursor, from, to } = parsed.data;
    const customerId = req.params.id ?? parsed.data.customerId;

    const where: Prisma.TransactionWhereInput = {};
    if (customerId) where.customerId = customerId;
    if (from || to) {
      where.ts = {};
      if (from) where.ts.gte = from;
      if (to) where.ts.lte = to;
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (!decoded) return res.status(400).json({ error: "Invalid cursor" });
      const boundary = new Date(decoded.value);
      where.AND = [
        { OR: [{ ts: { lt: boundary } }, { ts: boundary, id: { lt: decoded.id } }] },
      ];
    }

    const rows = await prisma.transaction.findMany({
      where,
      orderBy: [{ ts: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];
    const nextCursor = hasMore && last ? encodeCursor(last.ts.toISOString(), last.id) : null;

    return res.json({ items: page.map(toTransactionDTO), nextCursor });
  } catch (error) {
    console.error("Error listing transactions:", error);
    return res.status(500).json({ error: "Internal server error while fetching transactions" });
  }
};

/** GET /api/transaction/:id — full detail, including the alert's score + reasons. */
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const txn = await prisma.transaction.findUnique({ where: { id }, include: { alert: true } });
    if (!txn) return res.status(404).json({ error: "Transaction not found" });

    const { alert, ...transaction } = txn;
    return res.json({
      ...toTransactionDTO(transaction),
      alert: alert ? toAlertDTO(alert) : null,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return res.status(500).json({ error: "Internal server error while fetching transaction" });
  }
};
