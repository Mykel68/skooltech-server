import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import { setGradingSettings } from "../controllers/grading_setting.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Grading Settings
 *     description: Grading settings management endpoints
 */

/**
 * @swagger
 * /grading-settings/{school_id}/{class_id}:
 *   post:
 *     summary: Set grading settings for a class
 *     tags: [Grading Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the school
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               components:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     weight:
 *                       type: number
 *                   required: [name, weight]
 *             required: [components]
 *     responses:
 *       201:
 *         description: Grading settings created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     grading_setting_id:
 *                       type: string
 *                     class_id:
 *                       type: string
 *                     teacher_id:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     components:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           weight:
 *                             type: number
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 *       409:
 *         description: Grading setting already exists
 */
router.post(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  setGradingSettings
);

export default router;
