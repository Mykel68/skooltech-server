import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import * as sessionController from "../controllers/session.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Sessions
 *     description: Academic session management endpoints
 */

/**
 * @swagger
 * /sessions/{school_id}:
 *   post:
 *     summary: Create a new academic session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the school
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, start_date, end_date]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the session (e.g., 2024/2025)
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the session
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the session
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_id:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: School not found
 */
router.post(
  "/:school_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  sessionController.createSession
);

/**
 * @swagger
 * /sessions/{school_id}:
 *   get:
 *     summary: Get all sessions for a school
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the school
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       session_id:
 *                         type: string
 *                       school_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       start_date:
 *                         type: string
 *                         format: date-time
 *                       end_date:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:school_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  sessionController.getSessions
);

export default router;
