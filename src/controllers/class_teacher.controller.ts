import { Request, Response, NextFunction } from 'express';
import {
	createClassTeacher,
	deleteClassTeacher,
	listClassTeachers,
} from '../services/class_teacher.service';

export const assignClassTeacher = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = await createClassTeacher(req.body);
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
