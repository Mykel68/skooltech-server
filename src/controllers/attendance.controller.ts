import { Request, Response, NextFunction } from 'express';
import {
	getAttendance,
	getClassAttendance,
	getTeacherClassStudentsAttendanceReport,
	recordAttendance,
	recordBulkAttendance,
} from '../services/attendnce,service';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { calculateTotalSchoolDaysFromTerm } from '../utils/date.util';

export const recordStudentAttendance = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id } = req.params;
		const { student_id, class_id, term_id, session_id, days_present } =
			req.body;

		const data = await recordAttendance(
			school_id,
			student_id,
			class_id,
			term_id,
			session_id,
			days_present
		);

		res.status(200).json({ message: 'Attendance recorded', data });
	} catch (err) {
		next(err);
	}
};

export const getStudentAttendance = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id, student_id } = req.params;
		const { term_id, session_id } = req.query;

		const data = await getAttendance(
			school_id,
			student_id,
			term_id as string,
			session_id as string
		);

		res.status(200).json({ message: 'Attendance fetched', data });
	} catch (err) {
		next(err);
	}
};

// controllers/attendance.controller.ts
export const recordClassAttendance = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id, class_id, session_id, term_id } = req.params;
		const { attendances } = req.body;

		const result = await recordBulkAttendance({
			school_id,
			class_id,
			session_id,
			term_id,
			attendances,
		});

		sendResponse(res, 200, {
			message: 'Attendance recorded',
			data: result,
		});
	} catch (err) {
		next(err);
	}
};

export const fetchClassAttendance = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id, class_id } = req.params;
		const { session_id, term_id } = req.query;

		// Ideally calculate total school days from session/term config
		const total_school_days = await calculateTotalSchoolDaysFromTerm(
			term_id as string
		); // <-- implement this logic based on term start/end

		const result = await getClassAttendance(
			school_id,
			class_id,
			session_id as string,
			term_id as string,
			total_school_days
		);

		sendResponse(res, 200, { message: 'Attendance fetched', data: result });
	} catch (err) {
		next(err);
	}
};

export const handleVerifyClassTeacher = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id, teacher_id } = req.params;

		const session_id = (req.query.session_id ||
			(req as any).session_id) as string;
		const term_id = (req.query.term_id || (req as any).term_id) as string;

		if (!school_id || !teacher_id || !session_id || !term_id) {
			throw new AppError(
				'school_id, session_id, term_id, and teacher_id are required',
				400
			);
		}

		const data = await getTeacherClassStudentsAttendanceReport(
			school_id,
			session_id,
			term_id,
			teacher_id
		);

		sendResponse(res, 200, {
			message: 'Attendance report fetched successfully',
			data,
		});
	} catch (err) {
		next(err);
	}
};
