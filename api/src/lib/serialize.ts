// JSON cannot serialize BigInt. Convert BigInt values to strings recursively so
// responses (and idempotency snapshots) are JSON-safe.
export function jsonSafe<T>(value: T): unknown {
  return JSON.parse(JSON.stringify(value, (_key, val) => (typeof val === "bigint" ? val.toString() : val)));
}
