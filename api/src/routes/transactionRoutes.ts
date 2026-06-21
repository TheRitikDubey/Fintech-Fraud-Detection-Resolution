import { Router } from "express";
import { ingestTransactions, getCustomerTransactions } from "../controllers/transactionController";
import { idempotency } from "../middleware/idempotency";

const router = Router();

// POST /api/ingest/transactions - Ingest transactions (CSV or JSON), idempotent via Idempotency-Key
router.post("/ingest/transactions", idempotency, ingestTransactions);

// GET /api/customer/:id/transactions - Get customer transactions with pagination
router.get("/customer/:id/transactions", getCustomerTransactions);

export default router;
