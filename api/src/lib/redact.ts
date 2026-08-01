// PII redaction. Replaces PAN-like sequences (13–19 consecutive digits) with a marker.
// Used for the audit trail now; Step 8 reuses this across logs and API responses.
export const REDACTED = "****REDACTED****";

const PAN_RE = /\b\d{13,19}\b/g;

export function redactString(input: string): string {
  return input.replace(PAN_RE, REDACTED);
}

// Deep-redact strings within arbitrary JSON-like values (objects, arrays, strings).
export function redact<T>(value: T): T {
  if (typeof value === "string") return redactString(value) as T;
  if (Array.isArray(value)) return value.map((item) => redact(item)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) out[key] = redact(val);
    return out as T;
  }
  return value;
}
