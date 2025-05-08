import express from "express";
import * as gradeController from "../controllers/grade.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Grades
 *     description: Grade management endpoints
 */

/**
 * @swagger
 * /grades/{student_id}:
 *   get:
 *     summary: Get student grades
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the student
 *     responses:
 *       200:
 *         description: Student grades retrieved successfully
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
 *                       grade_id:
 *                         type: string
 *                       student_id:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       score:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid student ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get(
  "/:student_id",
  authMiddleware,
  gradeController.getStudentGradesController
);

export default router;
