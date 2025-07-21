import { Router } from "express";
import {
  fetchClassAttendance,
  getAttendanceSummaryHandler,
  getStudentAttendance,
  handleVerifyClassTeacher,
  markDailyAttendance,
  recordClassAttendance,
  recordStudentAttendance,
} from "../controllers/attendance.controller";
import {
  attachCurrentSessionTerm,
  authMiddleware,
  authorize,
  restrictToSchool,
  verify_X_API_KEY,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/:school_id/:teacher_id/fetch",
  authMiddleware,
  verify_X_API_KEY,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  handleVerifyClassTeacher
);

router.post(
  "/:school_id",
  authMiddleware,
  verify_X_API_KEY,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  recordStudentAttendance
);
router.post(
  "/daily",
  authMiddleware,
  verify_X_API_KEY,
  authorize(["Teacher"]),
  restrictToSchool(),
  markDailyAttendance
);
router.get(
  "/:school_id/:student_id",
  authMiddleware,
  verify_X_API_KEY,
  authorize(["Admin", "Teacher", "Student"]),
  restrictToSchool(),
  getStudentAttendance
);

router.post(
  "/:school_id/:class_id/record",
  authMiddleware,
  verify_X_API_KEY,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  recordClassAttendance
);

router.get(
  "/:school_id/:class_id/:session_id/:term_id/fetch",
  authMiddleware,
  verify_X_API_KEY,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  fetchClassAttendance
);

router.get(
  "/summary/:school_id/:class_id",
  authMiddleware,
  attachCurrentSessionTerm,
  verify_X_API_KEY,
  authorize(["Admin"]),
  restrictToSchool(),
  getAttendanceSummaryHandler
);

export default router;
