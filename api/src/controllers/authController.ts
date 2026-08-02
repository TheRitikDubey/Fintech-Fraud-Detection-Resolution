import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/client";
import { env } from "../config/env";
import { signupSchema, loginSchema } from "../schemas/auth";

function signToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_SECONDS });
}

function badRequest(res: Response, error: import("zod").ZodError): Response {
  return res.status(400).json({
    error: "Invalid request body",
    issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  });
}

/** POST /api/auth/signup → { token, user } */
export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error);
    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.appUser.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.appUser.create({ data: { email, passwordHash } });

    return res.status(201).json({ token: signToken(user.id, user.email), user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("signup failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/** POST /api/auth/login → { token, user } */
export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error);
    const email = parsed.data.email.toLowerCase();

    const user = await prisma.appUser.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    return res.json({ token: signToken(user.id, user.email), user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("login failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/** GET /api/auth/me → { user } (requires Bearer token) */
export const me = async (req: Request, res: Response) => {
  if (!req.auth) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.appUser.findUnique({ where: { id: req.auth.sub } });
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  return res.json({ user: { id: user.id, email: user.email } });
};
