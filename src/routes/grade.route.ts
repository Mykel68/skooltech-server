import express from 'express';
import * as gradeController from '../controllers/grade.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
const router = express.Router();
/**
 * @swagger
 * /grades/{student_id}:
 *   get:
 *     summary: Get student grades
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Student grades }
 */
router.get('/:student_id', authMiddleware, gradeController.getStudentGradesController);
export default router;