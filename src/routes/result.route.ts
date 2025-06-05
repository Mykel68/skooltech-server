import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import {
  getOwnScores,
  getScores,
  getStudentSubjectsAndScoresHandler,
} from "../controllers/student_score.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Student Scores
 *     description: Student score management endpoints
 */

/**
 * @swagger
 * /student-scores/subjects/{school_id}/{class_id}:
 *   get:
 *     summary: Get subjects and scores for a student in a class
 *     tags: [Student Scores]
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
 *         description: Student subjects and scores retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       score_id:
 *                         type: string
 *                       class:
 *                         type: object
 *                         properties:
 *                           class_id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           grade_level:
 *                             type: string
 *                       subject:
 *                         type: object
 *                         properties:
 *                           subject_id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       scores:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             component_name:
 *                               type: string
 *                             score:
 *                               type: number
 *                       total_score:
 *                         type: number
 *                       grade:
 *                         type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class, student, or scores not found
 */
router.get(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Student"]),
  restrictToSchool(),
  getOwnScores
);

export default router;
