import { Router } from "express";
import {
  createSuperAdminController,
  getAppStats,
} from "../controllers/super_admin.controller";
import {
  authMiddleware,
  authorize,
  verify_X_API_KEY,
} from "../middlewares/auth.middleware";

const router = Router();

// POST /api/superadmin
router.post(
  "/",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Super Admin"]),
  createSuperAdminController
);

// GET /api/superadmin/stats
router.get(
  "/stats",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Super Admin"]),
  getAppStats
);

export default router;
