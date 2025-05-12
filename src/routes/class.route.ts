import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";
import * as classController from "../controllers/class.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Classes
 *     description: Class management endpoints
 */

/**
 * @swagger
 * /classes/{school_id}:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the school
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
 *                 description: Name of the class
 *               grade_level:
 *                 type: string
 *                 description: Grade level of the class
 *     responses:
 *       201:
 *         description: Class created successfully
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
 *                     class_id:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     grade_level:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: School not found
 */
router.post(
  "/:school_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  classController.createClassHandler
);

/**
 * @swagger
 * /classes/{class_id}:
 *   get:
 *     summary: Get class details
 *     tags: [Classes]
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
 *         description: Class retrieved successfully
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
 *                     class_id:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     grade_level:
 *                       type: string
 *                       nullable: true
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
  "/:class_id",
  authMiddleware,
  authorize(["Admin", "Teacher"]),
  restrictToSchool(),
  classController.getClassHandler
);

export default router;
