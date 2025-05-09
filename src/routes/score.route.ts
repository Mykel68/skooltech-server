import express from 'express';
import { authMiddleware, authorize, restrictToSchool } from '../middlewares/auth.middleware';
import { ScoreController } from '../controllers/score.controller';

const router = express.Router();
const scoreController = new ScoreController();

/**
 * @swagger
 * tags:
 *   - name: Scores
 *     description: Score management endpoints
 */

/**
 * @swagger
 * /scores/{assessment_id}:
 *   post:
 *     summary: Assign a score to a student for an assessment
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the assessment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [student_id, score]
 *             properties:
 *               student_id:
 *                 type: string
 *                 description: UUID of the student
 *               score:
 *                 type: number
 *                 description: Score for the assessment
 *     responses:
 *       201:
 *         description: Score assigned successfully
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
 *                     score_id:
 *                       type: string
 *                     assessment_id:
 *                       type: string
 *                     student_id:
 *                       type: string
 *                     score:
 *                       type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assessment or student not found
 */
router.post('/:assessment_id', authMiddleware, authorize(['Teacher']), restrictToSchool(), scoreController.assignScore.bind(scoreController));

/**
 * @swagger
 * /scores/{class_id}/{subject_id}/students:
 *   get:
 *     summary: Get students enrolled in a class for a specific subject
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the class
 *       - in: path
 *         name: subject_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the subject
 *     responses:
 *       200:
 *         description: Students retrieved successfully
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
 *                       user_id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 * 
 *