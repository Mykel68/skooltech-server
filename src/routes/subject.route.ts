import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import * as subjectController from "../controllers/subject.controller";

const router = express.Router();

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
  subjectController.createSubjectHandler
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
  subjectController.approveSubjectHandler
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
  subjectController.getSubjectsByClassHandler
);

/**
 * @swagger
 * /details/subjects/{subject_id}:
 *   get:
 *     summary: Get subject details
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
 *         description: Subject retrieved successfully
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
router.get(
  "/details/:subject_id",
  authMiddleware,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  subjectController.getSubjectByIdHandler
);

/**
 * @swagger
 * /subjects/school/{school_id}:
 *   get:
 *     summary: Get all subjects of a school
 *     tags: [Subjects]
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
 *       404:
 *         description: School not found
 */
router.get(
  "/school/:school_id",
  authMiddleware,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  subjectController.getSubjectsOfaSchool
);

/**
 * @swagger
 * /subjects/class/{class_id}:
 *   get:
 *     summary: Get all subjects of a class
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
 *       404:
 *         description: Class not found
 */
router.get(
  "/class/:class_id",
  authMiddleware,
  authorize(["Admin", "Teacher", "Student"]),
  restrictToSchool(),
  subjectController.getSubjectsOfaClass
);

/**
 * @swagger
 * /subjects/teacher/{teacher_id}:
 *   get:
 *     summary: Get all subjects of a teacher
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacher_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the teacher
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
 *       404:
 *         description: Teacher not found
 */
router.get(
  "/teacher/:teacher_id",
  authMiddleware,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  subjectController.getSubjectsOfaTeacher
);

/**
 * @swagger
 * /subjects:
 *  delete:
 *    summary: Delete a subject
 *    tags: [Subjects]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: subject_id
 *        required: true
 *        schema:
 *          type: string
 *        description: UUID of the subject
 *    responses:
 *      200:
 *        description: Subject deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                data:
 *                  type: object
 *                  properties:
 *                    message:
 *                      type: string
 *                    subject:
 *                      type: object
 *                      properties:
 *                        subject_id:
 *                          type: string
 *                        school_id:
 *                          type: string
 *                        class_id:
 *                          type: string
 *                        teacher_id:
 *                          type: string
 *                        name:
 *                          type: string
 *                        is_approved:
 *                          type: boolean
 *      400:
 *        description: Invalid input
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Subject not found
 */
router.delete(
  "/:subject_id",
  authMiddleware,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  subjectController.deleteSubjectHandler
);

export default router;
