import { redact } from "./redact";

type Level = "info" | "warn" | "error";

// Structured JSON logs. Every line carries ts/level/event/masked, plus any extra fields.
// All string values are PAN-redacted before emission.
export function log(level: Level, event: string, fields: Record<string, unknown> = {}): void {
  const entry = redact({ ts: new Date().toISOString(), level, event, masked: true, ...fields });
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

// Masked customer id for logs — keep a readable prefix/suffix, hide the middle.
export function maskCustomerId(id?: string | null): string | undefined {
  if (!id) return undefined;
  return id.length <= 5 ? "***" : `${id.slice(0, 4)}***${id.slice(-2)}`;
}
