import express from "express";
import * as userController from "../controllers/user.controller";
import { verify_X_API_KEY } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user - Admin Only
 *     security: [{ bearerAuth: [] }]
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
 *               role: { type: string }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *     responses:
 *       201: { description: User created }
 */
router.post("/register", verify_X_API_KEY, userController.createUserController);

export default router;
