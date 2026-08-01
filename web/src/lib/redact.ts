// Mirror of the API's PAN redaction (api/src/lib/redact.ts) for defense-in-depth on render.
const PAN_RE = /\b\d{13,19}\b/g;
export const REDACTED = "****REDACTED****";

export function redactPII(value: string): string {
  return value.replace(PAN_RE, REDACTED);
}
