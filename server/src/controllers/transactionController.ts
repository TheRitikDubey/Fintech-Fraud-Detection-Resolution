import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TransactionData {
  customer_id: string;
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
}

interface PaginationQuery {
  from?: string;
  to?: string;
  cursor?: string;
  limit?: string;
}

export const ingestTransactions = async (req: Request, res: Response) => {
  try {
    const transactions: TransactionData[] = req.body.transactions;
    
    if (!Array.isArray(transactions)) {
      console.log("Invalid transactions format:", transactions);
      
      return res.status(400).json({ 
        error: "Request body mustt be an array of transactions" 
      });
    }

    if (transactions.length === 0) {
      return res.status(400).json({ 
        error: "No transactions provided" 
      });
    }

    // Validate required fields
    for (const txn of transactions) {
      if (!txn.customer_id || !txn.id || !txn.amount_cents || !txn.currency) {
        return res.status(400).json({ 
          error: "Each transaction must have customerId, txnId, amount, currency, and status" 
        });
      }
    }

    // Upsert transactions using Prisma's upsert
    // #TODO: Optimize bulk upsert if Prisma adds support in future
    const upsertPromises = transactions.map(async (txn) => {
      return prisma.transaction.upsert({
        where: {
          customerId_txnId: {
            customerId: txn.customer_id,
            txnId: txn.id
          }
        },
        update: {
          amount: txn.amount_cents,
          currency: txn.currency,
          status: txn.status || "NULL",
          updatedAt: new Date()
        },
        create: {
          customerId: txn.customer_id,
          txnId: txn.id,
          amount: txn.amount_cents,
          currency: txn.currency,
          status: txn.status || "NULL"
        }
      });
    });

    const results = await Promise.all(upsertPromises);

    res.json({
      message: `Successfully processed ${results.length} transactions`,
      processed: results.length,
      transactions: results
    });

  } catch (error) {
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

    // Build where clause for date filtering
    const whereClause: any = {
      customereId: customerId
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
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
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
