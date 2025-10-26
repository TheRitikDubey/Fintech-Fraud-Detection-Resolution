import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
// Create user
app.post("/users", async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: "name and email are required" });
    }
    const user = await prisma.user.create({ data: { name, email } });
    res.json(user);
});
// Get all users
app.get("/users", async (_req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});
app.get("/", (_req, res) => {
    return res.json({
        message: "FCR Server is up and running",
    });
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
export default app;
