import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

// Gate action endpoints behind X-API-Key. The key has a dev default (see config/env)
// so local triage works out of the box; set API_KEY in api/.env to override.
export function apiKey(req: Request, res: Response, next: NextFunction): void {
  const provided = req.header("X-API-Key");
  if (!provided || provided !== env.API_KEY) {
    res.status(401).json({ error: "Invalid or missing X-API-Key" });
    return;
  }
  next();
}
