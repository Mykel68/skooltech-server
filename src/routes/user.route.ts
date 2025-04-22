import express from "express";
import * as userController from "../controllers/user.controller";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user (Teacher or Student)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Teacher, Student]
 *               first_name:
 *                 type: string
 *                 nullable: true
 *               last_name:
 *                 type: string
 *                 nullable: true
 *               school_id:
 *                 type: string
 *                 description: UUID of the school
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 school_id:
 *                   type: string
 *                 is_approved:
 *                   type: boolean
 *       400:
 *         description: Invalid input
 *       404:
 *         description: School not found
 */
router.post("/", userController.registerUserController);

/**
 * @swagger
 * /users/{user_id}:
 *   patch:
 *     summary: Update user profile
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 nullable: true
 *               email:
 *                 type: string
 *                 nullable: true
 *               first_name:
 *                 type: string
 *                 nullable: true
 *               last_name:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                   nullable: true
 *                 last_name:
 *                   type: string
 *                   nullable: true
 *                 role:
 *                   type: string
 *                 school_id:
 *                   type: string
 *                 is_approved:
 *                   type: boolean
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
router.patch("/profile/:user_id", userController.updateUserController);

export default router;
