import express from "express";
import * as schoolController from "../controllers/school.controller";
import * as classController from "../controllers/class.controller";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Schools
 *     description: School management endpoints
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new school and its admin user
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, admin_username, admin_password, admin_email]
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
 *                         role:
 *                           type: string
 *                           enum: ['Admin']
 *       400:
 *         description: Invalid input or username/email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/register", schoolController.createSchoolController);

/**
 * @swagger
 * /schools/code/{school_code}:
 *   get:
 *     summary: Get school details by school code
 *     tags: [Schools]
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
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     school_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                       nullable: true
 *                     school_image:
 *                       type: string
 *                       nullable: true
 *                     phone_number:
 *                       type: string
 *                       nullable: true
 *                     school_code:
 *                       type: string
 *                       nullable: true
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/code/:school_code", schoolController.getSchoolByCodeController);

/**
 * @swagger
 * /schools/profile/{school_id}:
 *   get:
 *     summary: Get school details by school ID
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
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
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     school_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                       nullable: true
 *                     school_image:
 *                       type: string
 *                       nullable: true
 *                     phone_number:
 *                       type: string
 *                       nullable: true
 *                     school_code:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get(
  "/profile/:school_id",
  authMiddleware,
  schoolController.getSchoolByIdController
);

/**
 * @swagger
 * /schools/profile/{school_id}:
 *   patch:
 *     summary: Update school details
 *     tags: [Schools]
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
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     school_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                       nullable: true
 *                     school_image:
 *                       type: string
 *                       nullable: true
 *                     phone_number:
 *                       type: string
 *                       nullable: true
 *                     school_code:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.patch(
  "/profile/:school_id",
  authMiddleware,
  schoolController.updateSchoolController
);

/**
 * @swagger
 * /classes/{school_id}:
 *   get:
 *     summary: Get all classes of a school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the school
 *     responses:
 *       200:
 *         description: All classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       class_id:
 *                         type: string
 *                       school_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       grade_level:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: School not found
 */
router.get(
  "/classes/:school_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  classController.getAllClassesHandler
);

export default router;
