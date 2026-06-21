import { Router } from "express";
import { listAlerts } from "../controllers/alertController";

const router = Router();

// GET /api/alerts?status=&risk=&cursor=&limit= - Keyset-paginated alert queue
router.get("/alerts", listAlerts);

export default router;
