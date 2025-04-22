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
 *                 nullable: true
 *                 description: Optional unique code for the school
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
router.post("/", schoolController.createSchoolController);

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
 *                   nullable: true
 *       404:
 *         description: School not found
 */
router.get("/code/:school_code", schoolController.getSchoolByCodeController);

/**
 * @swagger
 * /schools/{school_id}:
 *   get:
 *     summary: Get school details by school ID
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the school
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
 *                   nullable: true
 *       404:
 *         description: School not found
 */
router.get("/profile/:school_id", schoolController.getSchoolByIdController);

/**
 * @swagger
 * /schools/{school_id}:
 *   patch:
 *     summary: Update school details
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
 *             properties:
 *               name:
 *                 type: string
 *                 nullable: true
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
 *                 nullable: true
 *     responses:
 *       200:
 *         description: School updated successfully
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
 *                   nullable: true
 *       400:
 *         description: Invalid input
 *       404:
 *         description: School not found
 */
router.patch("/profile/:school_id", schoolController.updateSchoolController);

export default router;
