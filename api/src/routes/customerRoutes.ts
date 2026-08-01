import { Router } from "express";
import { listTransactions } from "../controllers/transactionController";
import { getCustomerSummary } from "../controllers/customerController";

const router = Router();

// GET /api/customer/:id/transactions - Keyset-paginated transactions for one customer
router.get("/customer/:id/transactions", listTransactions);

// GET /api/customer/:id/summary - Top merchants, categories, monthly trend, anomalies
router.get("/customer/:id/summary", getCustomerSummary);

export default router;
