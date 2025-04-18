import express from "express";
import * as schoolController from "../controllers/school.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * /schools:
 *   post:
 *     summary: Register a new school
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: 'Name of the school' }
 *               address: { type: string, description: 'Address of the school (optional)' }
 *     responses:
 *       201:
 *         description: School created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object, properties: { school_id: { type: string }, name: { type: string }, address: { type: string } } }
 *       400: { description: Invalid input }
 *       403: { description: Unauthorized }
 */
router.post("/", authMiddleware, schoolController.createSchoolController);

export default router;
