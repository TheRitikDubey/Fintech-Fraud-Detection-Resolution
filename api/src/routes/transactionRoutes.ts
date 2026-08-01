import { Router } from "express";
import { ingestTransactions, listTransactions, getTransaction } from "../controllers/transactionController";
import { idempotency } from "../middleware/idempotency";

const router = Router();

// POST /api/ingest/transactions - Ingest transactions (CSV or JSON), idempotent via Idempotency-Key
router.post("/ingest/transactions", idempotency, ingestTransactions);

// GET /api/transactions - Global keyset-paginated list (optional ?customerId= filter)
router.get("/transactions", listTransactions);

// GET /api/transaction/:id - Full transaction detail incl. alert score + reasons
router.get("/transaction/:id", getTransaction);

export default router;
