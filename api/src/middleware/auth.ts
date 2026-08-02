import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthPayload {
  sub: string; // AppUser id
  email: string;
}

// Require a valid Bearer JWT; attaches the decoded payload to req.auth.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.auth = { sub: decoded.sub, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
