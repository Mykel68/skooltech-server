import { Request, Response, NextFunction } from 'express';
import {
	createClassTeacher,
	deleteClassTeacher,
	listClassTeachers,
} from '../services/class_teacher.service';
import { AppError } from '../utils/error.util';
import { AuthRequest } from '../middlewares/auth.middleware';

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
		res.status(201).json({
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
		const data = await listClassTeachers(req.query);
		res.status(200).json({ data });
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
		await deleteClassTeacher(req.params.id);
		res.status(200).json({ message: 'Class teacher removed successfully' });
	} catch (err) {
		next(err);
	}
};
