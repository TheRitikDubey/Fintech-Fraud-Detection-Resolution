import express from "express";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app: express.Application = express();
const prisma = new PrismaClient();

app.use(express.json());

// Create user
app.post("/users", async (req: Request, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const user = await prisma.user.create({ data: { name, email } as any });
  res.json(user);
});

// Get all users
app.get("/users", async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/", (_req: Request, res: Response) => {
  return res.json({
    message: "FCR Server is up and running",
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
