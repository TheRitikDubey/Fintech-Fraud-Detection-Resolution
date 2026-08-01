import type { Request, Response } from "express";
import { prisma } from "../db/client";
import {
  freezeCardSchema,
  openDisputeSchema,
  markFalsePositiveSchema,
} from "../schemas/action";
import { ensureCaseForAlert, appendCaseEvent } from "../services/caseService";
import { toolCallTotal } from "../metrics/registry";

function actorOf(req: Request): string {
  return req.header("X-Actor") ?? "support-agent";
}

function badRequest(res: Response, error: import("zod").ZodError): Response {
  return res.status(400).json({
    error: "Invalid request body",
    issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  });
}

/** POST /api/action/freeze-card → { status: "PENDING_OTP" | "FROZEN" } */
export const freezeCard = async (req: Request, res: Response) => {
  try {
    toolCallTotal.labels("freeze_card").inc();
    const parsed = freezeCardSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error);
    const { alertId, cardId, otp } = parsed.data;

    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    // Resolve the target card. When none is named, take the customer's first not-yet-frozen
    // card so the two-step (PENDING_OTP → FROZEN) freeze acts on the same card.
    const card = cardId
      ? await prisma.card.findUnique({ where: { id: cardId } })
      : await prisma.card.findFirst({
          where: { customerId: alert.customerId, status: { not: "FROZEN" } },
          orderBy: { createdAt: "asc" },
        });

    // A supplied OTP confirms the freeze; otherwise it stays pending OTP verification.
    const status = otp ? "FROZEN" : "PENDING_OTP";
    if (card) await prisma.card.update({ where: { id: card.id }, data: { status } });

    const triageCase = await ensureCaseForAlert(alertId, alert.customerId, "FREEZE");
    await appendCaseEvent(triageCase.id, actorOf(req), "FREEZE_CARD", {
      alertId,
      cardId: card?.id ?? null,
      otpProvided: Boolean(otp),
      status,
    });

    return res.json({ status });
  } catch (error) {
    console.error("freeze-card failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/** POST /api/action/open-dispute → { caseId, status: "OPEN" } */
export const openDispute = async (req: Request, res: Response) => {
  try {
    toolCallTotal.labels("open_dispute").inc();
    const parsed = openDisputeSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error);
    const { alertId, reason } = parsed.data;

    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    const triageCase = await ensureCaseForAlert(alertId, alert.customerId, "DISPUTE");
    await prisma.case.update({ where: { id: triageCase.id }, data: { kind: "DISPUTE", status: "OPEN" } });
    await prisma.alert.update({ where: { id: alertId }, data: { status: "TRIAGED" } });

    await appendCaseEvent(triageCase.id, actorOf(req), "OPEN_DISPUTE", {
      alertId,
      reason: reason ?? null,
    });

    return res.json({ caseId: triageCase.id, status: "OPEN" });
  } catch (error) {
    console.error("open-dispute failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/** POST /api/action/mark-false-positive → { alertId, status } */
export const markFalsePositive = async (req: Request, res: Response) => {
  try {
    toolCallTotal.labels("mark_false_positive").inc();
    const parsed = markFalsePositiveSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error);
    const { alertId, note } = parsed.data;

    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: { status: "FALSE_POSITIVE" },
    });

    const triageCase = await ensureCaseForAlert(alertId, alert.customerId, "TRIAGE");
    await prisma.case.update({ where: { id: triageCase.id }, data: { status: "RESOLVED" } });

    await appendCaseEvent(triageCase.id, actorOf(req), "MARK_FALSE_POSITIVE", {
      alertId,
      note: note ?? null,
    });

    return res.json({ alertId, status: updated.status });
  } catch (error) {
    console.error("mark-false-positive failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
