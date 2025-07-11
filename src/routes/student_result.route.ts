import { Router } from "express";
import { getStudentResultHandler } from "../controllers/student_result.controller";
import {
  authMiddleware,
  authorize,
  verify_X_API_KEY,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/results",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Student"]),
  getStudentResultHandler
);

export default router;
