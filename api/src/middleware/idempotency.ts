import type { Request, Response, NextFunction } from "express";
import {
  getIdempotentResponse,
  saveIdempotentResponse,
  hashRequest,
} from "../lib/idempotency";

// Minimal typed view of express-fileupload's attachment to the request.
interface UploadedFile {
  data?: Buffer;
}
interface RequestWithFiles extends Request {
  files?: Record<string, UploadedFile | UploadedFile[]> | null;
}

// Build a stable string fingerprint of the request body (JSON, raw CSV text, or upload)
// so a replayed key with a different payload can be rejected.
function fingerprintBody(req: Request): string {
  if (typeof req.body === "string") return req.body;

  let base = "";
  try {
    base = JSON.stringify(req.body ?? null);
  } catch {
    base = "";
  }

  const files = (req as RequestWithFiles).files;
  if (files) {
    for (const value of Object.values(files)) {
      const file = Array.isArray(value) ? value[0] : value;
      if (file?.data) base += `:${hashRequest(file.data.toString("base64"))}`;
    }
  }
  return base;
}

/**
 * Honors the `Idempotency-Key` header. Without it, requests pass straight through.
 * With it: a matching prior response is replayed; the same key reused with a different
 * payload is a 422; otherwise the response is captured and stored for future replays.
 */
export async function idempotency(req: Request, res: Response, next: NextFunction): Promise<void> {
  const key = req.header("Idempotency-Key");
  if (!key) {
    next();
    return;
  }

  const requestHash = hashRequest(`${req.method}:${req.originalUrl}:${fingerprintBody(req)}`);

  const existing = await getIdempotentResponse(key);
  if (existing) {
    if (existing.requestHash !== requestHash) {
      res.status(422).json({
        error: "Idempotency-Key was reused with a different request payload",
      });
      return;
    }
    res.status(existing.status).json(existing.body);
    return;
  }

  // Capture the response as it is sent, then persist it for replays.
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown): Response => {
    void saveIdempotentResponse(key, { requestHash, status: res.statusCode, body });
    return originalJson(body);
  }) as Response["json"];

  next();
}
