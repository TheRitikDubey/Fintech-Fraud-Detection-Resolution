// Opaque keyset cursor over a (sortValue, id) tuple. Ordering is always
// (sortColumn DESC, id DESC) so ties on the sort column are broken deterministically —
// no rows skipped or repeated across pages (unlike OFFSET).
export interface DecodedCursor {
  value: string; // ISO timestamp of the sort column at the page boundary
  id: string; // tie-breaker id at the page boundary
}

const SEP = "::"; // cuid/cuid2 ids never contain "::"

export function encodeCursor(value: string, id: string): string {
  return Buffer.from(`${value}${SEP}${id}`).toString("base64url");
}

export function decodeCursor(raw: string): DecodedCursor | null {
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const sep = decoded.indexOf(SEP);
    if (sep === -1) return null;
    const value = decoded.slice(0, sep);
    const id = decoded.slice(sep + SEP.length);
    if (!value || !id || Number.isNaN(Date.parse(value))) return null;
    return { value, id };
  } catch {
    return null;
  }
}
