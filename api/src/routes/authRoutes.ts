import { Router } from "express";
import { signup, login, me } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, me);

export default router;
