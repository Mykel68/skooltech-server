import express from "express";
import * as schoolController from "../controllers/school.controller";
import { verify_X_API_KEY } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * /schools:
 *   post:
 *     summary: Register a new school and its admin user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the school
 *               address:
 *                 type: string
 *                 description: Address of the school (optional)
 *               admin_username:
 *                 type: string
 *                 description: Username for the school admin
 *               admin_password:
 *                 type: string
 *                 description: Password for the school admin
 *               admin_email:
 *                 type: string
 *                 description: Email for the school admin
 *               admin_first_name:
 *                 type: string
 *                 description: First name of the admin (optional)
 *               admin_last_name:
 *                 type: string
 *                 description: Last name of the admin (optional)
 *     responses:
 *       201:
 *         description: School and admin created successfully
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
 *                     school:
 *                       type: object
 *                       properties:
 *                         school_id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                           nullable: true
 *                     admin:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Invalid input
 */
router.post(
  "/register",
  verify_X_API_KEY,
  schoolController.createSchoolController
);

export default router;
