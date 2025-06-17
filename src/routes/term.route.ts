import express from 'express';
import {
	authMiddleware,
	authorize,
	restrictToSchool,
} from '../middlewares/auth.middleware';
import * as termController from '../controllers/term.controller';

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
 *           format: uuid
 *         description: UUID of the school
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
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
	'/:school_id/:session_id',
	authMiddleware,
	authorize(['Admin']),
	restrictToSchool(),
	termController.createTerm
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
 *           format: uuid
 *         description: UUID of the term
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
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
 *             description: At least one field must be provided. Any combination of fields can be updated.
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
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
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
	'/:school_id/:session_id/:term_id',
	authMiddleware,
	authorize(['Admin']),
	restrictToSchool(),
	termController.updateSchoolTerm
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
 *           format: uuid
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
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
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
	'/:session_id',
	authMiddleware,
	authorize(['Admin', 'Teacher', 'Student']),
	restrictToSchool(),
	termController.getTerms
);

/**
 * @swagger
 * /sessions/{school_id}:
 *   get:
 *     summary: Retrieve all academic sessions and their terms for a school
 *     tags: [Sessions]
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
 *     responses:
 *       200:
 *         description: School sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         term_id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         start_date:
 *                           type: string
 *                           format: date-time
 *                         end_date:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid school ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

router.get(
	'/school/:school_id',
	authMiddleware,
	authorize(['Admin', 'Teacher', 'Student']),
	restrictToSchool(),
	termController.getSessions
);

export default router;
