import express from "express";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";
import {
  createSession,
  editSession,
  getSessionByIdController,
  getSessions,
} from "../controllers/session.controller";

const router = express.Router();

/**
 * @swagger
 * /sessions/{school_id}:
 *   post:
 *     summary: Create a new session for a school
 *     tags: [Sessions]
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
 *                 description: Name of the session (e.g., 2023/2024)
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start date of the session
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date of the session
 *               is_active:
 *                 type: boolean
 *                 description: Whether the session is active (deactivates other sessions if true)
 *                 default: false
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
 *                     is_active:
 *                       type: boolean
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       404:
 *         description: School not found
 */
router.post("/:school_id", authMiddleware, authorize(["Admin"]), createSession);

/**
 * @swagger
 * /sessions/{school_id}/{session_id}:
 *   patch:
 *     summary: Update an existing session
 *     tags: [Sessions]
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
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the session (e.g., 2023/2024)
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start date of the session
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date of the session
 *               is_active:
 *                 type: boolean
 *                 description: Whether the session is active (deactivates other sessions if true)
 *             description: At least one field must be provided. Any combination of fields can be updated.
 *     responses:
 *       200:
 *         description: Session updated successfully
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
 *                     is_active:
 *                       type: boolean
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       404:
 *         description: School or session not found
 */
router.patch(
  "/:school_id/:session_id",
  authMiddleware,
  authorize(["Admin"]),
  editSession
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
 *           format: uuid
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
 *                       is_active:
 *                         type: boolean
 *                       start_date:
 *                         type: string
 *                         format: date-time
 *                       end_date:
 *                         type: string
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid school ID
 *       403:
 *         description: Forbidden
 */
router.get("/:school_id", authMiddleware, getSessions);

/**
 * @swagger
 * /sessions/{school_id}/{session_id}:
 *   get:
 *     summary: Get a session by ID
 *     tags: [Sessions]
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
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the session
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     school_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:
 *                       type: string
 *                       example: 2023/2024
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T00:00:00.000Z
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-12-31T00:00:00.000Z
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T00:00:00.000Z
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-02-01T00:00:00.000Z
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 */

router.get("/:school_id/:session_id", authMiddleware, getSessionByIdController);

export default router;
