import { Router } from "express";
import { apiKey } from "../middleware/apiKey";
import { idempotency } from "../middleware/idempotency";
import { freezeCard, openDispute, markFalsePositive } from "../controllers/actionController";

const router = Router();

// Every action requires X-API-Key and is idempotent via Idempotency-Key.
router.post("/action/freeze-card", apiKey, idempotency, freezeCard);
router.post("/action/open-dispute", apiKey, idempotency, openDispute);
router.post("/action/mark-false-positive", apiKey, idempotency, markFalsePositive);

export default router;
