import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

interface NormalizedTransactionData {
  customerId: string;
  txnId: string;
  amount: number;
  currency: string;
  status: string;
  mcc: string;
  merchant: string;
  country: string;
  city: string;
  createdAt?: Date;
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

const normalizeTransaction = (txn: TransactionPayload, index: number): NormalizedTransactionData => {
  const displayIndex = index + 1;
  const customerId = typeof txn.customer_id === "string" ? txn.customer_id.trim() : "";
  const txnId = typeof txn.id === "string" ? txn.id.trim() : "";
  const currency = typeof txn.currency === "string" ? txn.currency.trim() : "";
  const mcc = typeof txn.mcc === "string" ? txn.mcc.trim() : "";
  const merchant = typeof txn.merchant === "string" ? txn.merchant.trim() : "";
  const country = typeof txn.country === "string" ? txn.country.trim() : "";
  const city = typeof txn.city === "string" ? txn.city.trim() : "";
  const rawAmount = txn.amount_cents ?? txn.amount;
  const amount = typeof rawAmount === "string" ? Number(rawAmount.trim()) : Number(rawAmount);

  if (!customerId || !txnId || !currency || !mcc || !merchant || !country || !city || !Number.isFinite(amount)) {
    throw new Error(
      `Transaction at row ${displayIndex} must include customer_id, id, amount/amount_cents, currency, mcc, merchant, country, and city`
    );
  }

  let createdAt: Date | undefined;
  if (typeof txn.ts === "string" && txn.ts.trim().length > 0) {
    const parsedDate = new Date(txn.ts);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Transaction at row ${displayIndex} has invalid ts value: ${txn.ts}`);
    }
    createdAt = parsedDate;
  }

  return {
    customerId,
    txnId,
    amount,
    currency,
    status: typeof txn.status === "string" && txn.status.trim().length > 0 ? txn.status.trim() : "SUCCESS",
    mcc,
    merchant,
    country,
    city,
    createdAt
  };
};

export const ingestTransactions = async (req: Request, res: Response) => {
  try {
    const csvContent = getCsvContentFromRequest(req);
    let transactions: TransactionPayload[] | null;

    // Try parsing CSV first if content is available, otherwise fallback to JSON parsing
    try {
      transactions = csvContent
        ? parseCsvTransactions(csvContent)
        : getJsonTransactionsFromRequest(req);
    } catch (parseError) {
      return res.status(400).json({
        error: parseError instanceof Error ? parseError.message : "Invalid CSV format"
      });
    }
    
    if (!Array.isArray(transactions)) {
      console.log("Invalid transactions format:", transactions);
      
      return res.status(400).json({
        error: "Provide transactions as JSON array/object or upload a CSV file"
      });
    }

    if (transactions.length === 0) {
      return res.status(400).json({ 
        error: "No transactions provided" 
      });
    }

    let normalizedTransactions: NormalizedTransactionData[];
    try {
      normalizedTransactions = transactions.map((txn, index) => normalizeTransaction(txn, index));
    } catch (validationError) {
      return res.status(400).json({
        error: validationError instanceof Error ? validationError.message : "Invalid transaction payload"
      });
    }

    // Upsert transactions using Prisma's upsert
    // #TODO: Optimize bulk upsert if Prisma adds support in future
    const upsertPromises = normalizedTransactions.map(async (txn) => {
      return prisma.transaction.upsert({
        where: {
          customerId_txnId: {
            customerId: txn.customerId,
            txnId: txn.txnId
          }
        },
        update: {
          amount: txn.amount,
          currency: txn.currency,
          status: txn.status,
          mcc: txn.mcc,
          merchant: txn.merchant,
          country: txn.country,
          city: txn.city,
          createdAt: txn.createdAt,
          updatedAt: new Date()
        },
        create: {
          customerId: txn.customerId,
          txnId: txn.txnId,
          amount: txn.amount,
          currency: txn.currency,
          status: txn.status,
          mcc: txn.mcc,
          merchant: txn.merchant,
          country: txn.country,
          city: txn.city,
          createdAt: txn.createdAt
        }
      });
    });

    const results = await Promise.all(upsertPromises);

    res.json({
      accepted: true,
      message: `Successfully processed ${results.length} transactions`,
      count: results.length,
      requestId: "val"
    });

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

    res.json({
      transactions: resultTransactions,
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
