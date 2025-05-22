import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import {
  assignScores,
  editScores,
  getScores,
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
 * /student-scores/{school_id}/{class_id}:
 *   post:
 *     summary: Assign scores to students in a class
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     scores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           component_name:
 *                             type: string
 *                           score:
 *                             type: number
 *                         required: [component_name, score]
 *                   required: [user_id, scores]
 *             required: [scores]
 *     responses:
 *       201:
 *         description: Student scores assigned successfully
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
 *                       grading_setting_id:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       class_id:
 *                         type: string
 *                       teacher_id:
 *                         type: string
 *                       school_id:
 *                         type: string
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
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class, student, or grading setting not found
 *       409:
 *         description: Scores already assigned
 */
router.post(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  assignScores
);

/**
 * @swagger
 * /student-scores/{school_id}/{class_id}:
 *   get:
 *     summary: Retrieve student scores for a class
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
 *         description: Student scores retrieved successfully
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
 *                       student:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: string
 *                           first_name:
 *                             type: string
 *                           last_name:
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
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class or grading setting not found
 */
router.get(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  getScores
);

/**
 * @swagger
 * /student-scores/{school_id}/{class_id}:
 *   patch:
 *     summary: Edit student scores for a class
 *     tags: [Student Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema:
 *           type: string
 *         description: School ID
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score_id:
 *                 type: string
 *               scores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     scores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           component_name:
 *                             type: string
 *                           score:
 *                             type: number
 *                         required: [component_name, score]
 *                   required: [user_id, scores]
 *             required: [score_id, scores]
 *     responses:
 *       201:
 *         description: Student scores edited successfully
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
 *                       grading_setting_id:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       class_id:
 *                         type: string
 *                       teacher_id:
 *                         type: string
 *                       school_id:
 *                         type: string
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
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class, student, or grading setting not found
 *       409:
 *         description: Scores already assigned
 */
router.patch(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  editScores
);

export default router;
