import { NextFunction, Request, Response } from 'express';
import * as classService from '../services/class.service';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Handle class creation request
 */
export const createClassHandler = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { school_id } = req.params;
	const { name, grade_level, short } = req.body;
	console.log('Class instance', school_id, name, grade_level, short);
	console.log('Body', req.body);
	try {
		if (!school_id || !name) {
			throw new AppError('School ID and name are required', 400);
		}

		const classInstance = await classService.createClass(
			school_id,
			name,
			grade_level,
			short
		);

		sendResponse(res, 201, {
			class_id: classInstance.class_id,
			school_id: classInstance.school_id,
			name: classInstance.name,
			grade_level: classInstance.grade_level,
		});
	} catch (error: any) {
		console.log('Error', error);
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

/**
 * update class by ID
 */

export const updateClass = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { class_id, school_id } = req.params;
		const updates = req.body;
		const updatedClass = await classService.updateClass(
			class_id,
			school_id,
			updates
		);
		res.json({ success: true, data: updatedClass });
	} catch (err) {
		next(err);
	}
};

/**
 * Delete class by ID
 */

export const deleteClass = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { class_id, school_id } = req.params;
		await classService.deleteClass(class_id, school_id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

/**
 * Handle fetching a class by ID
 */
export const getClassHandler = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { class_id } = req.params;
	const school_id = (req as any).user?.school_id;

	try {
		if (!class_id) {
			throw new AppError('Class ID is required', 400);
		}

		const classInstance = await classService.getClassById(
			class_id,
			school_id
		);

		sendResponse(res, 200, {
			class_id: classInstance.class_id,
			school_id: classInstance.school_id,
			name: classInstance.name,
			grade_level: classInstance.grade_level,
		});
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

/**
 * Handle fetching all classes of a school
 */
export const getAllClassesHandler = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { school_id } = req.params;
	const session_id = (req.query.session_id as string) || req.session_id;
	const term_id = (req.query.term_id as string) || req.term_id;

	try {
		if (!school_id || !session_id || !term_id) {
			throw new AppError(
				'school_id, session_id and term_id are required',
				400
			);
		}

		const classes = await classService.getAllClassesOfSchool(
			school_id,
			String(session_id),
			String(term_id)
		);

		sendResponse(res, 200, { classes });
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

export const getStudentClassHandler = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { school_id, student_id } = req.params;

	try {
		if (!school_id || !student_id) {
			throw new AppError('School ID and student ID are required', 400);
		}

		const classInstance = await classService.getStudentClass(
			school_id,
			student_id
		);

		sendResponse(res, 200, {
			class_id: classInstance.class_id,
			school_id: classInstance.school_id,
			name: classInstance.name,
			grade_level: classInstance.grade_level,
			student_count: (classInstance as any).student_count,
		});
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};
