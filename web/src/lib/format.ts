// Display formatting helpers. Money arrives from the API as integer cents in a string.

export function formatMoney(amountCents: string, currency = "USD"): string {
  const amount = Number(amountCents) / 100;
  if (!Number.isFinite(amount)) return amountCents;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
