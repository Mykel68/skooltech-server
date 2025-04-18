import express from 'express';
import * as authController from '../controllers/auth.controller';
const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object, properties: { token: { type: string } } }
 */

/**
 * @swagger
 * /auth/register/{school_id}:
 *   post:
 *     summary: User self-registration for a specific school
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema: { type: string }
 *         description: The ID of the school the user is registering for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *               email: { type: string }
 *               role: { type: string, enum: ['Student', 'Teacher'] }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object, properties: { user_id: { type: string }, username: { type: string }, email: { type: string } } }
 */
router.post('/login', authController.loginController);
router.post('/register/:school_id', authController.registerController);

export default router;