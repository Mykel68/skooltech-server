import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import {
  deleteGradingSettings,
  getGradingSettings,
  setGradingSettings,
  updateGradingSettings,
} from "../controllers/grading_setting.controller";

const router = express.Router();

/**
 * POST /grading-settings/:school_id/:class_id/:subject_id
 */
router.post(
  "/:school_id/:class_id/:subject_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  setGradingSettings
);

/**
 * GET /grading-settings/:school_id/:class_id/:subject_id
 */
router.get(
  "/:school_id/:class_id/:subject_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  getGradingSettings
);

/**
 * PUT /grading-settings/:school_id/:class_id/:subject_id
 */
router.put(
  "/:school_id/:class_id/:subject_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  updateGradingSettings
);

/**
 * DELETE /grading-settings/:school_id/:class_id/:subject_id
 */
router.delete(
  "/:school_id/:class_id/:subject_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  deleteGradingSettings
);

export default router;
