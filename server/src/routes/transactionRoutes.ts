import { Router } from "express";
import { ingestTransactions, getCustomerTransactions } from "../controllers/transactionController.js";

const router = Router();

// POST /api/ingest/transactions - Ingest transactions (CSV or JSON)
router.post("/ingest/transactions", ingestTransactions);

// GET /api/customer/:id/transactions - Get customer transactions with pagination
router.get("/customer/:id/transactions", getCustomerTransactions);

export default router;
