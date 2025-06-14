import express from 'express';
import {
	assignClassTeacher,
	getClassTeachers,
	removeClassTeacher,
} from '../controllers/class_teacher.controller';
import {
	authMiddleware,
	authorize,
	restrictToSchool,
} from '../middlewares/auth.middleware';

const router = express.Router();

router.post(
	'/assign/teacher',
	authMiddleware,
	authorize(['Admin']),
	restrictToSchool(),
	assignClassTeacher
); // Assign a teacher

router.get('/', getClassTeachers); // List assigned class teachers
router.delete('/:id', removeClassTeacher); // Remove an assignment

export default router;
