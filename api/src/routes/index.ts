import { Router } from "express";
import transactionRoutes from "./transactionRoutes";
import customerRoutes from "./customerRoutes";
import alertRoutes from "./alertRoutes";

const router = Router();

// Mount all route modules under /api
router.use("/api", transactionRoutes);
router.use("/api", customerRoutes);
router.use("/api", alertRoutes);

export default router;
