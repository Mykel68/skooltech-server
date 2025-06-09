import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as sessionService from '../services/session.service';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { AuthRequest } from '../middlewares/auth.middleware';

// Schema for creating a session
const createSessionSchema = Joi.object({
	name: Joi.string().required(),
	start_date: Joi.date().iso().required(),
	end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
	is_active: Joi.boolean().default(false),
});

// Schema for editing a session
const editSessionSchema = Joi.object({
	name: Joi.string().allow('').optional(),
	start_date: Joi.date().iso().optional(),
	end_date: Joi.date().iso().optional(),
	is_active: Joi.boolean().optional(),
}).min(1); // At least one field must be provided

// Create session controller
export const createSession = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (req.user?.role !== 'Admin') {
			throw new AppError('Only admins can create sessions', 403);
		}

		const { school_id } = req.params;
		const { name, start_date, end_date, is_active } = req.body;

		const { error, value } = createSessionSchema.validate({
			name,
			start_date,
			end_date,
			is_active,
		});
		if (error) throw new AppError(error.details[0].message, 400);

		const session = await sessionService.createSession(
			school_id,
			value.name,
			new Date(value.start_date),
			new Date(value.end_date),
			value.is_active
		);

		sendResponse(res, 201, {
			session_id: session.session_id,
			school_id: session.school_id,
			name: session.name,
			is_active: session.is_active,
			start_date: session.start_date,
			end_date: session.end_date,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 500));
	}
};

// Edit session controller
export const editSession = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (req.user?.role !== 'Admin') {
			throw new AppError('Only admins can edit sessions', 403);
		}

		const { school_id, session_id } = req.params;
		const { name, start_date, end_date, is_active } = req.body;

		const { error, value } = editSessionSchema.validate({
			name,
			start_date,
			end_date,
			is_active,
		});
		if (error) throw new AppError(error.details[0].message, 400);

		const session = await sessionService.editSession(
			school_id,
			session_id,
			{
				name: value.name,
				start_date: value.start_date
					? new Date(value.start_date)
					: undefined,
				end_date: value.end_date ? new Date(value.end_date) : undefined,
				is_active: value.is_active,
			}
		);

		sendResponse(res, 200, {
			session_id: session.session_id,
			school_id: session.school_id,
			name: session.name,
			is_active: session.is_active,
			start_date: session.start_date,
			end_date: session.end_date,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 500));
	}
};

// Get sessions controller
export const getSessions = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id } = req.params;

		if (!school_id) {
			throw new AppError('School ID is required', 400);
		}

		if (req.user?.role !== 'Admin' && req.user?.school_id !== school_id) {
			throw new AppError(
				'Cannot access sessions from another school',
				403
			);
		}

		const sessions = await sessionService.getSessions(school_id);
		sendResponse(res, 200, sessions);
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 500));
	}
};

export const getSessionByIdController = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized: No user data', 401);
		}

		const { session_id } = req.params;
		const school_id = req.user.school_id;

		const session = await sessionService.getSessionById(
			session_id,
			school_id
		);

		sendResponse(res, 200, session);
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 500));
	}
};

export const getUserSessionsTerms = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const user_id = req.user?.user_id;
		const role = req.user?.role;
		const { school_id } = req.params;

		if (!school_id) throw new Error('School ID is required');

		const data = await sessionService.getUserSessionsAndTerms(
			user_id!,
			role!,
			school_id
		);
		sendResponse(res, 200, data);
	} catch (error: any) {
		next(error);
	}
};
