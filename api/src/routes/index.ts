import { Router } from "express";
import transactionRoutes from "./transactionRoutes";
import customerRoutes from "./customerRoutes";
import alertRoutes from "./alertRoutes";
import actionRoutes from "./actionRoutes";
import authRoutes from "./authRoutes";
import { rateLimit } from "../middleware/rateLimit";

const router = Router();

// Per-client rate limit on every API route (5 req/s -> 429 + Retry-After).
router.use("/api", rateLimit);

// Mount all route modules under /api
router.use("/api", authRoutes);
router.use("/api", transactionRoutes);
router.use("/api", customerRoutes);
router.use("/api", alertRoutes);
router.use("/api", actionRoutes);

export default router;
