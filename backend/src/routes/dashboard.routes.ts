import { Router } from "express";
import { getStats, getActivity } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/stats", authenticate, getStats);
router.get("/activity", authenticate, getActivity);

export default router;
