import type { Case, Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { redact } from "../lib/redact";

// One Case per alert (the triage container). Lazily created on the first action.
export async function ensureCaseForAlert(
  alertId: string,
  customerId: string,
  kind: string,
): Promise<Case> {
  const existing = await prisma.case.findUnique({ where: { alertId } });
  if (existing) return existing;
  return prisma.case.create({ data: { alertId, customerId, kind } });
}

// Append an immutable audit row. The payload is redacted before it is stored.
export async function appendCaseEvent(
  caseId: string,
  actor: string,
  action: string,
  payload: unknown,
): Promise<void> {
  const redacted = redact(payload) as Prisma.InputJsonValue;
  await prisma.caseEvent.create({ data: { caseId, actor, action, payload: redacted } });
}
