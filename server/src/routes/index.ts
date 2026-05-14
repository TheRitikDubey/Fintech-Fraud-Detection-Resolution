import { Router } from "express";
import transactionRoutes from "./transactionRoutes";

const router = Router();

// Mount all route modules
router.use("/api", transactionRoutes);

export default router;
