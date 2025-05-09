import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import { SubjectController } from "../controllers/subject.controller";

const router = express.Router();
const subjectController = new SubjectController();

/**
 * @swagger
 * tags:
 *   - name: Subjects
 *     description: Subject management endpoints
 */

/**
 * @swagger
 * /subjects/{class_id}:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the subject
 *     responses:
 *       201:
 *         description: Subject created successfully
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
 *                     subject_id:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     class_id:
 *                       type: string
 *                     teacher_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     is_approved:
 *                       type: boolean
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class or teacher not found
 */
router.post(
  "/:class_id",
  authMiddleware,
  authorize(["Teacher"]),
  restrictToSchool(),
  subjectController.createSubject.bind(subjectController)
);

/**
 * @swagger
 * /subjects/{subject_id}/approve:
 *   patch:
 *     summary: Approve a subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subject_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the subject
 *     responses:
 *       200:
 *         description: Subject approved successfully
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
 *                     subject_id:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     class_id:
 *                       type: string
 *                     teacher_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     is_approved:
 *                       type: boolean
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject not found
 */
router.patch(
  "/:subject_id/approve",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  subjectController.approveSubject.bind(subjectController)
);

/**
 * @swagger
 * /subjects/{class_id}:
 *   get:
 *     summary: Get subjects by class
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the class
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
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
 *                       subject_id:
 *                         type: string
 *                       school_id:
 *                         type: string
 *                       class_id:
 *                         type: string
 *                       teacher_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       is_approved:
 *                         type: boolean
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:class_id",
  authMiddleware,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  subjectController.getSubjectsByClass.bind(subjectController)
);

export default router;
