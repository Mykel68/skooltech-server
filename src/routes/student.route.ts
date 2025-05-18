import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import * as getStudentController from "../controllers/student.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Student management endpoints
 */

/**
 * @swagger
 * /students/{school_id}/{class_id}:
 *   get:
 *     summary: Get all students in a class
 *     tags: [Students]
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
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   student_id:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 */
router.get(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  getStudentController.getStudentByClass
);

export default router;
