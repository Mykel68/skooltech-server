import express from "express";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
  restrictToSession,
} from "../middlewares/auth.middleware";
import {
  createTerm,
  updateTerm,
  deleteTerm,
  getTerms,
} from "../controllers/term.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Terms
 *     description: Academic term management endpoints
 */

/**
 * @swagger
 * /terms/{school_id}/{session_id}:
 *   post:
 *     summary: Create a new academic term
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: school_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the school
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, start_date, end_date]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the term (e.g., 1st Term)
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the term
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the term
 *     responses:
 *       201:
 *         description: Term created successfully
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
 *                     term_id:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     session_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 */
router.post(
  "/:school_id/:session_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  createTerm
);

/**
 * @swagger
 * /terms/{term_id}:
 *   patch:
 *     summary: Update an academic term
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: term_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the term
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, start_date, end_date]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the term
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the term
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the term
 *     responses:
 *       200:
 *         description: Term updated successfully
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
 *                     term_id:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     session_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Term not found
 */
router.patch(
  "/:term_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  updateTerm
);

/**
 * @swagger
 * /terms/{term_id}:
 *   delete:
 *     summary: Delete an academic term
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: term_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the term
 *     responses:
 *       204:
 *         description: Term deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Term not found
 */
router.delete(
  "/:term_id",
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  deleteTerm
);

/**
 * @swagger
 * /terms/{session_id}:
 *   get:
 *     summary: Get all terms for a session
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: false
 *         schema:
 *           type: string
 *         description: UUID of the session (optional, defaults to current session)
 *     responses:
 *       200:
 *         description: Terms retrieved successfully
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
 *                       term_id:
 *                         type: string
 *                       school_id:
 *                         type: string
 *                       session_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       start_date:
 *                         type: string
 *                         format: date-time
 *                       end_date:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 */
router.get(
  "/:session_id?",
  authMiddleware,
  authorize(["Admin", "Teacher", "Student"]),
  restrictToSchool(),
  restrictToSession(),
  getTerms
);

export default router;
