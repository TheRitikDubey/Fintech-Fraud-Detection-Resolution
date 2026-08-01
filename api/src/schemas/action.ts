import { z } from "zod";

// All triage actions are anchored on the alert being worked. customerId/card are derived.
export const freezeCardSchema = z.object({
  alertId: z.string().min(1, "alertId is required"),
  cardId: z.string().min(1).optional(), // defaults to the customer's active card
  otp: z.string().min(1).optional(), // when present -> FROZEN, else PENDING_OTP
});

export const openDisputeSchema = z.object({
  alertId: z.string().min(1, "alertId is required"),
  reason: z.string().optional(),
});

export const markFalsePositiveSchema = z.object({
  alertId: z.string().min(1, "alertId is required"),
  note: z.string().optional(),
});

export type FreezeCardInput = z.infer<typeof freezeCardSchema>;
export type OpenDisputeInput = z.infer<typeof openDisputeSchema>;
export type MarkFalsePositiveInput = z.infer<typeof markFalsePositiveSchema>;
