import { Request, Response, NextFunction } from 'express';
import {
	createClassTeacher,
	deleteClassTeacher,
	listClassTeachers,
} from '../services/class_teacher.service';
import { AppError } from '../utils/error.util';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendResponse } from '../utils/response.util';

export const assignClassTeacher = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id } = req.params;
		const { class_id, teacher_id } = req.body;
		const { session_id, term_id } = req.query;

		if (!school_id || !session_id || !term_id || !class_id) {
			throw new AppError(
				'school_id, session_id, term_id, and class_id are required',
				400
			);
		}
		const data = await createClassTeacher(
			school_id,
			session_id as string,
			term_id as string,
			teacher_id,
			class_id
		);
		sendResponse(res, 201, {
			message: 'Class teacher assigned successfully',
			data,
		});
	} catch (err) {
		next(err);
	}
};

export const getClassTeachers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id } = req.params;
		const { session_id, term_id } = req.query;

		if (!school_id || !session_id || !term_id) {
			throw new AppError(
				'school_id, session_id, term_id are required',
				400
			);
		}
		const data = await listClassTeachers(
			school_id,
			session_id as string,
			term_id as string
		);
		sendResponse(res, 200, {
			message: 'Class teacher assigned successfully',
			data,
		});
	} catch (err) {
		next(err);
	}
};

export const removeClassTeacher = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		console.log('Hellomm');
		const { class_teacher_id } = req.params;
		await deleteClassTeacher(class_teacher_id);
		sendResponse(res, 200, {
			message: 'Class teacher removed successfully',
		});
	} catch (err) {
		next(err);
	}
};
