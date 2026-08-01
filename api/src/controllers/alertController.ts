import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { alertsQuerySchema } from "../schemas/query";
import { decodeCursor, encodeCursor } from "../lib/cursor";
import { toAlertDTO } from "../lib/dto";

/**
 * GET /api/alerts?status=&risk=&cursor=&limit= — keyset-paginated alert queue.
 * Orders by (createdAt DESC, id DESC) via the (status, createdAt DESC) index; each item
 * embeds its transaction summary for the queue UI. Returns { items, nextCursor }.
 */
export const listAlerts = async (req: Request, res: Response) => {
  try {
    const parsed = alertsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    const { limit, cursor, status, risk } = parsed.data;

    const where: Prisma.AlertWhereInput = {};
    if (status) where.status = status;
    if (risk) where.severity = risk;

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (!decoded) return res.status(400).json({ error: "Invalid cursor" });
      const boundary = new Date(decoded.value);
      where.AND = [
        { OR: [{ createdAt: { lt: boundary } }, { createdAt: boundary, id: { lt: decoded.id } }] },
      ];
    }

    const rows = await prisma.alert.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: { transaction: true },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];
    const nextCursor = hasMore && last ? encodeCursor(last.createdAt.toISOString(), last.id) : null;

    return res.json({ items: page.map(toAlertDTO), nextCursor });
  } catch (error) {
    console.error("Error listing alerts:", error);
    return res.status(500).json({ error: "Internal server error while fetching alerts" });
  }
};
