import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import { AssessmentController } from "../controllers/assessment.controller";

const router = express.Router();
const assessmentController = new AssessmentController();

/**
 * @swagger
 * tags:
 *   - name: Assessments
 *     description: Assessment management endpoints
 */

/**
 * @swagger
 * /assessments/{subject_id}:
 *   post:
 *     summary: Create a new assessment for a subject in a class
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subject_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_id, term_id, name, type, date, max_score]
 *             properties:
 *               class_id:
 *                 type: string
 *                 description: UUID of the class
 *               term_id:
 *                 type: string
 *                 description: UUID of the term
 *               name:
 *                 type: string
 *                 description: Name of the assessment
 *               type:
 *                 type: string
 *                 enum: [Exam, Quiz, Assignment]
 *                 description: Type of the assessment
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the assessment
 *               max_score:
 *                 type: number
 *                 description: Maximum score for the assessment
 *     responses:
 *       201:
 *         description: Assessment created successfully
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
 *                     assessment_id:
 *                       type: string
 *                     subject_id:
 *                       type: string
 *                     class_id:
 *                       type: string
 *                     term_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     max_score:
 *                       type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject, class, or term not found
 */
router.post(
  "/:subject_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  assessmentController.createAssessment.bind(assessmentController)
);

/**
 * @swagger
 * /assessments/{class_id}/{subject_id}/{term_id}:
 *   get:
 *     summary: Get assessments by class, subject, and term
 *     tags: [Assessments]
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
 *       - in: path
 *         name: term_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the term
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully
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
 *                       assessment_id:
 *                         type: string
 *                       subject_id:
 *                         type: string
 *                       class_id:
 *                         type: string
 *                       term_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       max_score:
 *                         type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Term not found
 */
router.get(
  "/:class_id/:subject_id/:term_id",
  authMiddleware,
  authorize(["Teacher", "Student"]),
  restrictToSchool(),
  assessmentController.getAssessmentsByClassAndSubject.bind(
    assessmentController
  )
);

export default router;
