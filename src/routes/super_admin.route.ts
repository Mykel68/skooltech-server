import { Router } from "express";
import { createSuperAdminController } from "../controllers/super_admin.controller";

const router = Router();

// POST /api/superadmin
router.post("/", createSuperAdminController);

export default router;
