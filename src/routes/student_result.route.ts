import { Router } from "express";
import { getStudentResultHandler } from "../controllers/student_result.controller";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/results",
  authMiddleware,
  authorize(["Student"]),
  getStudentResultHandler
);

export default router;
