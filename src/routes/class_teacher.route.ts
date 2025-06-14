import express from 'express';
import {
	assignClassTeacher,
	getClassTeachers,
	removeClassTeacher,
} from '../controllers/class_teacher.controller';
import {
	attachCurrentSessionTerm,
	authMiddleware,
	authorize,
	restrictToSchool,
	verify_X_API_KEY,
} from '../middlewares/auth.middleware';

const router = express.Router();

router.post(
	'/:school_id/assign/teacher',
	authMiddleware,
	attachCurrentSessionTerm,
	verify_X_API_KEY,
	authorize(['Admin']),
	restrictToSchool(),
	assignClassTeacher
); // Assign a teacher

router.get(
	'/:school_id/',
	authMiddleware,
	attachCurrentSessionTerm,
	verify_X_API_KEY,
	authorize(['Admin']),
	restrictToSchool(),
	getClassTeachers
); // List assigned class teachers
router.delete('/:id', removeClassTeacher); // Remove an assignment

export default router;
