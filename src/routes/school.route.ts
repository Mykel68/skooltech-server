import express from "express";
import * as schoolController from "../controllers/school.controller";

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
 *               address:
 *                 type: string
 *                 nullable: true
 *               school_image:
 *                 type: string
 *                 nullable: true
 *               phone_number:
 *                 type: string
 *                 nullable: true
 *               school_code:
 *                 type: string
 *                 description: Unique code for the school
 *               admin_username:
 *                 type: string
 *               admin_password:
 *                 type: string
 *               admin_email:
 *                 type: string
 *               admin_first_name:
 *                 type: string
 *                 nullable: true
 *               admin_last_name:
 *                 type: string
 *                 nullable: true
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
 *                         school_image:
 *                           type: string
 *                           nullable: true
 *                         phone_number:
 *                           type: string
 *                           nullable: true
 *                         school_code:
 *                           type: string
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
router.post("/register", schoolController.createSchoolController);

/**
 * @swagger
 * /schools/code/{school_code}:
 *   get:
 *     summary: Get school details by school code
 *     parameters:
 *       - in: path
 *         name: school_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique code of the school
 *     responses:
 *       200:
 *         description: School details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 school_id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                   nullable: true
 *                 school_image:
 *                   type: string
 *                   nullable: true
 *                 phone_number:
 *                   type: string
 *                   nullable: true
 *                 school_code:
 *                   type: string
 *       404:
 *         description: School not found
 */
router.get("/code/:school_code", schoolController.getSchoolByCodeController);

export default router;
