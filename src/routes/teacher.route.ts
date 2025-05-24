import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import { getTeachers } from "../controllers/class.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Classes
 *     description: Class management endpoints
 */

/**
 * @swagger
 * /classes/{school_id}/{class_id}/teachers:
 *   get:
 *     summary: Retrieve teachers teaching a specific class and their subjects
 *     tags: [Classes]
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
 *         description: Teachers retrieved successfully
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
 *                       teacher_id:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       subject:
 *                         type: object
 *                         properties:
 *                           subject_id:
 *                             type: string
 *                           name:
 *                             type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class or student not found
 */
router.get(
  "/:school_id/:class_id/teachers",
  authMiddleware,
  authorize(["Student"]),
  restrictToSchool(),
  getTeachers
);

export default router;
