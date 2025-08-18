import { Router } from "express";
import {
  createSuperAdminController,
  getAppStats,
  getSchools,
  getUsers,
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

// GET /api/school/get-all-schools
router.get(
  "/schools",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Super Admin"]),
  getSchools
);

// GET /api/user/get-all-users
router.get(
  "/users",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Super Admin"]),
  getUsers
);
export default router;
