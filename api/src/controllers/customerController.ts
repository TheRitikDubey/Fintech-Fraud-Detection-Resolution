import type { Request, Response } from "express";
import { prisma } from "../db/client";
import { toAlertDTO } from "../lib/dto";

interface MonthlyTrendRow {
  month: Date;
  count: bigint;
  sum: bigint;
}

/**
 * GET /api/customer/:id/summary — top merchants, top MCC categories, monthly spend
 * trend, and the customer's most anomalous alerts.
 */
export const getCustomerSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [topMerchants, topCategories, anomalies, monthlyTrend] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["merchant"],
        where: { customerId: id },
        _count: { _all: true },
        _sum: { amountCents: true },
        orderBy: { _count: { merchant: "desc" } },
        take: 10,
      }),
      prisma.transaction.groupBy({
        by: ["mcc"],
        where: { customerId: id },
        _count: { _all: true },
        _sum: { amountCents: true },
        orderBy: { _count: { mcc: "desc" } },
        take: 10,
      }),
      prisma.alert.findMany({
        where: { customerId: id },
        orderBy: { score: "desc" },
        take: 10,
        include: { transaction: true },
      }),
      prisma.$queryRaw<MonthlyTrendRow[]>`
        SELECT date_trunc('month', "ts") AS month,
               count(*)::bigint AS count,
               COALESCE(sum("amountCents"), 0)::bigint AS sum
        FROM "transactions"
        WHERE "customerId" = ${id}
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT 12`,
    ]);

    return res.json({
      customerId: id,
      topMerchants: topMerchants.map((m) => ({
        merchant: m.merchant,
        count: m._count._all,
        totalCents: (m._sum.amountCents ?? 0n).toString(),
      })),
      topCategories: topCategories.map((c) => ({
        mcc: c.mcc,
        count: c._count._all,
        totalCents: (c._sum.amountCents ?? 0n).toString(),
      })),
      monthlyTrend: monthlyTrend
        .map((row) => ({
          month: row.month.toISOString().slice(0, 7), // YYYY-MM
          count: Number(row.count),
          totalCents: row.sum.toString(),
        }))
        .reverse(), // chronological for charting
      anomalies: anomalies.map(toAlertDTO),
    });
  } catch (error) {
    console.error("Error building customer summary:", error);
    return res.status(500).json({ error: "Internal server error while building summary" });
  }
};
