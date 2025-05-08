import express from "express";
import * as userController from "../controllers/user.controller";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
} from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user (Teacher or Student)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - role
 *               - school_id
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: student1
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@school.com
 *               role:
 *                 type: string
 *                 enum: [Teacher, Student]
 *                 example: Student
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: John
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: Doe
 *               school_id:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the school
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174001
 *                     username:
 *                       type: string
 *                       example: student1
 *                     email:
 *                       type: string
 *                       example: student@school.com
 *                     role:
 *                       type: string
 *                       example: Student
 *                     school_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     is_approved:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input"
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "School not found"
 */
router.post("/", userController.registerUserController);

/**
 * @swagger
 * /users/profile/{user_id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the user
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174001
 *                     username:
 *                       type: string
 *                       example: student1
 *                     email:
 *                       type: string
 *                       example: student@school.com
 *                     first_name:
 *                       type: string
 *                       nullable: true
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       nullable: true
 *                       example: Doe
 *                     role:
 *                       type: string
 *                       example: Student
 *                     school_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     is_approved:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.get(
  "/profile/:user_id",
  authMiddleware,
  userController.getUserController
);

/**
 * @swagger
 * /users/profile/{user_id}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the user
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 nullable: true
 *                 example: student1_updated
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *                 example: student_updated@school.com
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: John Updated
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: Doe
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174001
 *                     username:
 *                       type: string
 *                       example: student1_updated
 *                     email:
 *                       type: string
 *                       example: student_updated@school.com
 *                     first_name:
 *                       type: string
 *                       nullable: true
 *                       example: John Updated
 *                     last_name:
 *                       type: string
 *                       nullable: true
 *                       example: Doe
 *                     role:
 *                       type: string
 *                       example: Student
 *                     school_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     is_approved:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.patch(
  "/profile/:user_id",
  authMiddleware,
  userController.updateUserController
);

/**
 * @swagger
 * /users/{school_id}/teachers:
 *   get:
 *     summary: Get all teachers for a school
 *     tags: [Teachers]
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
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Teachers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                         example: 123e4567-e89b-12d3-a456-426614174001
 *                       username:
 *                         type: string
 *                         example: teacher1
 *                       email:
 *                         type: string
 *                         example: teacher@school.com
 *                       first_name:
 *                         type: string
 *                         nullable: true
 *                         example: Jane
 *                       last_name:
 *                         type: string
 *                         nullable: true
 *                         example: Doe
 *                       role:
 *                         type: string
 *                         example: Teacher
 *                       school_id:
 *                         type: string
 *                         format: uuid
 *                         example: 123e4567-e89b-12d3-a456-426614174000
 *                       is_approved:
 *                         type: boolean
 *                         example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid token"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Insufficient permissions"
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "School not found"
 */
router.get(
  "/:school_id/teachers",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  userController.getTeachersBySchoolController
);

/**
 * @swagger
 * /users/{school_id}/students:
 *   get:
 *     summary: Get all students for a school
 *     tags: [Students]
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
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                         example: 123e4567-e89b-12d3-a456-426614174002
 *                       username:
 *                         type: string
 *                         example: student1
 *                       email:
 *                         type: string
 *                         example: student@school.com
 *                       first_name:
 *                         type: string
 *                         nullable: true
 *                         example: John
 *                       last_name:
 *                         type: string
 *                         nullable: true
 *                         example: Doe
 *                       role:
 *                         type: string
 *                         example: Student
 *                       school_id:
 *                         type: string
 *                         format: uuid
 *                         example: 123e4567-e89b-12d3-a456-426614174000
 *                       is_approved:
 *                         type: boolean
 *                         example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid token"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Insufficient permissions"
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "School not found"
 */
router.get(
  "/:school_id/students",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  userController.getStudentsBySchoolController
);

/**
 * @swagger
 * /users/teachers/{user_id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the teacher
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       200:
 *         description: Teacher retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174001
 *                     username:
 *                       type: string
 *                       example: teacher1
 *                     email:
 *                       type: string
 *                       example: teacher@school.com
 *                     first_name:
 *                       type: string
 *                       nullable: true
 *                       example: Jane
 *                     last_name:
 *                       type: string
 *                       nullable: true
 *                       example: Doe
 *                     role:
 *                       type: string
 *                       example: Teacher
 *                     school_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     is_approved:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid token"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Insufficient permissions"
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Teacher not found"
 */
router.get(
  "/teachers/:user_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  userController.getTeacherByIdController
);

/**
 * @swagger
 * /users/teachers/{user_id}:
 *   patch:
 *     summary: Update a teacher's details
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the teacher
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 nullable: true
 *                 example: teacher1_updated
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *                 example: teacher_updated@school.com
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: Jane Updated
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: Doe
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174001
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                       example: teacher_updated@school.com
 *                     first_name:
 *                       type: string
 *                       nullable: true
 *                       example: Jane Updated
 *                     last_name:
 *                       type: string
 *                       nullable: true
 *                       example: Doe
 *                     role:
 *                       type: string
 *                       example: Teacher
 *                     school_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     is_approved:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid token"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Insufficient permissions"
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Teacher not found"
 */
router.patch(
  "/teachers/:user_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  userController.updateTeacherController
);

/**
 * @swagger
 * /users/teachers/{user_id}/verify:
 *   patch:
 *     summary: Verify or disverify a teacher
 *     description: Sets the teacher's approval status to true (verify) or false (disverify), controlling their access to school resources.
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the teacher
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_approved
 *             properties:
 *               is_approved:
 *                 type: boolean
 *                 description: Set to true to verify the teacher, false to disverify
 *                 example: true
 *     responses:
 *       200:
 *         description: Teacher verification status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174001
 *                     username:
 *                       type: string
 *                       example: teacher1
 *                     email:
 *                       type: string
 *                       example: teacher@school.com
 *                     first_name:
 *                       type: string
 *                       nullable: true
 *                       example: Jane
 *                     last_name:
 *                       type: string
 *                       nullable: true
 *                       example: Doe
 *                     role:
 *                       type: string
 *                       example: Teacher
 *                     school_id:
 *                       type: string
 *                       format: uuid
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     is_approved:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid token"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Insufficient permissions"
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Teacher not found"
 */
router.patch(
  "/teachers/:user_id/verify",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  userController.verifyTeacherController
);

/**
 * @swagger
 * /users/teachers/{user_id}:
 *   delete:
 *     summary: Delete a teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the teacher
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Teacher deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid token"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Insufficient permissions"
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Teacher not found"
 */
router.delete(
  "/teachers/:user_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  userController.deleteTeacherController
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
export default router;
