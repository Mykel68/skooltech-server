import { Router } from 'express';
import {
	fetchClassAttendance,
	getStudentAttendance,
	recordClassAttendance,
	recordStudentAttendance,
} from '../controllers/attendance.controller';
import {
	authMiddleware,
	authorize,
	restrictToSchool,
	verify_X_API_KEY,
} from '../middlewares/auth.middleware';

const router = Router();

router.post(
	'/:school_id',
	authMiddleware,
	verify_X_API_KEY,
	authorize(['Admin', 'Teacher']),
	restrictToSchool(),
	recordStudentAttendance
);
router.get(
	'/:school_id/:student_id',
	authMiddleware,
	verify_X_API_KEY,
	authorize(['Admin', 'Teacher', 'Student']),
	restrictToSchool(),
	getStudentAttendance
);

router.post(
	'/:school_id/:class_id/:session_id/:term_id/record',
	authMiddleware,
	verify_X_API_KEY,
	authorize(['Admin', 'Teacher']),
	restrictToSchool(),
	recordClassAttendance
);

router.get(
	'/:school_id/:class_id/:session_id/:term_id/fetch',
	authMiddleware,
	verify_X_API_KEY,
	authorize(['Admin', 'Teacher']),
	restrictToSchool(),
	fetchClassAttendance
);

export default router;
