import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import {
  assignScores,
  bulkEditScores,
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
 *     summary: Create new scores for students in a class
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
 *         description: Student scores created successfully
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
 *         description: Scores already exist
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
 *                       class:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             class_id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             grade_level:
 *                               type: string
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
 *   patch:
 *     summary: Update existing student scores in a class
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
 *       200:
 *         description: Student scores updated successfully
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
 *         description: Class, student, or scores not found
 */
router.post(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  assignScores
);

router.get(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  getScores
);

router.patch(
  "/:school_id/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  editScores
);

/**
 * @swagger
 * /student-scores/bulk/{school_id}/{class_id}:
 *   patch:
 *     summary: Bulk update existing student scores in a class
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
 *       200:
 *         description: Student scores bulk updated successfully
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
 *         description: Class, student, or scores not found
 */

router.patch(
  "/bulk/:school_id/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  bulkEditScores
);

export default router;
