import { Request, Response } from "express";
import crypto from "node:crypto";
import { prisma } from "../db/client";
import { transactionBatchSchema, normalizeTxn } from "../schemas/transaction";
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

interface PaginationQuery {
  from?: string;
  to?: string;
  cursor?: string;
  limit?: string;
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

export const getCustomerTransactions = async (req: Request, res: Response) => {
  try {
    const { id: customerId } = req.params;
    const { from, to, cursor, limit = "50" }: PaginationQuery = req.query;

    if (!customerId) {
      return res.status(400).json({ 
        error: "Customer ID is required" 
      });
    }

    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        error: "Limit must be a number between 1 and 100" 
      });
    }
    // console.log("T",customerId);
    
    // Build where clause for date filtering
    const whereClause: any = {
      customerId: customerId
    };

    if (from || to) {
      whereClause.createdAt = {};
      if (from) {
        whereClause.createdAt.gte = new Date(from);
      }
      if (to) {
        whereClause.createdAt.lte = new Date(to);
      }
    }

    // Build cursor-based pagination
    const orderBy: any = {
      createdAt: 'desc'
    };

    if (cursor) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lt: new Date(cursor)
      };
    }

    // Fetch transactions with keyset pagination
    // #TODO: Add proper whereClause back when testing is done
    const transactions = await prisma.transaction.findMany({
      // where: whereClause,
      orderBy: orderBy,
      take: limitNum + 1, // Take one extra to check if there are more records
    });

    // Check if there are more records
    const hasMore = transactions.length > limitNum;
    const nextCursor = hasMore ? transactions[limitNum - 1].createdAt.toISOString() : null;

    // Remove the extra record if it exists
    const resultTransactions = hasMore ? transactions.slice(0, limitNum) : transactions;

    // BigInt is not JSON-serializable; expose amountCents as a string. (Step 4 reworks
    // this endpoint with proper keyset pagination + a typed response serializer.)
    const serialized = resultTransactions.map((txn) => ({
      ...txn,
      amountCents: txn.amountCents.toString()
    }));

    res.json({
      transactions: serialized,
      pagination: {
        hasMore,
        nextCursor,
        limit: limitNum,
        count: resultTransactions.length
      }
    });

  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    res.status(500).json({ 
      error: "Internal server error while fetching transactions" 
    });
  }
};
