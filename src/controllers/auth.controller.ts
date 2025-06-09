import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { UserRegistrationData } from '../types/models.types';
import Joi from 'joi';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Term } from '../models/term.model';
import Session from '../models/session.model';

const loginSchema = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
});

const registrationSchema = Joi.object({
	username: Joi.string().min(3).max(30).required(),
	password: Joi.string().min(8).required(),
	email: Joi.string().email().required(),
	role: Joi.string().valid('Student', 'Teacher').required(),
	first_name: Joi.string().max(50).optional(),
	last_name: Joi.string().max(50).optional(),
});

// const teacherStudentRegistrationSchema = Joi.object({
//   username: Joi.string().min(3).max(30).required(),
//   password: Joi.string().min(8).required(),
//   email: Joi.string().email().required(),
//   role: Joi.string().valid("Student", "Teacher").required(),
//   first_name: Joi.string().max(50).optional(),
//   last_name: Joi.string().max(50).optional(),
// });

export const teacherStudentRegistrationSchema = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().min(6).required(),
	email: Joi.string().email().required(),
	role: Joi.string()
		.valid('Student', 'Teacher', 'Admin', 'Parent')
		.required(),
	first_name: Joi.string().required(),
	last_name: Joi.string().required(),

	// Conditional class_id rule
	class_id: Joi.when('role', {
		is: 'Student',
		then: Joi.string().uuid().required(),
		otherwise: Joi.forbidden(),
	}),
});

const teacherStudentLoginSchema = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
	school_code: Joi.string().required(),
});

export const loginController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { error, value } = loginSchema.validate(req.body);
		if (error) throw new AppError(error.details[0].message, 400);

		const { username, password } = value;
		const token = await authService.login(username, password);
		sendResponse(res, 200, { token });
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const registerController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { school_id } = req.params;
		if (!school_id) {
			throw new AppError('School ID is required', 400);
		}

		const { error, value } = registrationSchema.validate(req.body);
		if (error) throw new AppError(error.details[0].message, 400);

		const userData: UserRegistrationData = {
			...value,
			school_id: school_id,
		};
		const user = await userService.registerUser(userData);

		sendResponse(res, 201, {
			user_id: user.user_id,
			username: user.username,
			email: user.email,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const loginTeacherStudentController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { error, value } = teacherStudentLoginSchema.validate(req.body);
		if (error) throw new AppError(error.details[0].message, 400);

		const { username, password, school_code } = value;
		const token = await authService.loginTeacherStudent(
			username,
			password,
			school_code
		);
		sendResponse(res, 200, { token });
	} catch (error: any) {
		console.log('err', error);
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const registerTeacherStudentController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	// console.log("registerTeacherStudentController", req.body);
	try {
		const { school_id } = req.params;
		if (!school_id) {
			throw new AppError('School ID is required', 400);
		}

		const { error, value } = teacherStudentRegistrationSchema.validate(
			req.body
		);
		if (error) throw new AppError(error.details[0].message, 400);

		// Merge school_id into the validated data
		const user = await authService.registerTeacherStudent({
			...value,
			school_id,
		});
		console.log('user', user);

		sendResponse(res, 201, {
			user_id: user.user_id,
			username: user.username,
			email: user.email,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

// Register teacher or student controller
export const registerTeacherStudent = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id } = req.params;

		if (!school_id) {
			throw new AppError('School ID is required', 400);
		}

		const { error, value } = teacherStudentRegistrationSchema.validate(
			req.body
		);
		if (error) throw new AppError(error.details[0].message, 400);

		// Get active session and term for the school
		const [activeSession, activeTerm] = await Promise.all([
			Session.findOne({ where: { school_id, is_active: true } }),
			Term.findOne({ where: { school_id, is_active: true } }),
		]);

		if (!activeSession) throw new AppError('Active session not found', 404);
		if (!activeTerm) throw new AppError('Active term not found', 404);

		const user = await authService.registerTeacherStudent({
			...value,
			school_id,
			session_id: activeSession.session_id,
			term_id: activeTerm.term_id,
		});

		sendResponse(res, 201, {
			user_id: user.user_id,
			username: user.username,
			email: user.email,
			role: user.role,
			first_name: user.first_name,
			last_name: user.last_name,
			school_id: user.school_id,
			is_approved: user.is_approved,
		});
	} catch (error: any) {
		console.log('registerTeacherStudent', error);
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const forgotPasswordController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email } = req.body;
		await authService.requestPasswordReset(email);
		sendResponse(res, 200, {
			message: 'Password reset email sent',
		});
	} catch (err: any) {
		res.status(400).json({ message: err.message });
	}
};

export const resetPasswordController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { token, newPassword } = req.body;
		await authService.resetPassword(token, newPassword);
		sendResponse(res, 200, {
			message: 'Password has been reset',
		});
	} catch (err: any) {
		res.status(400).json({ message: err.message });
	}
};

export const checkUsernameAvailability = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { username, school_id } = req.query;

		if (!username || typeof username !== 'string') {
			throw new AppError('Username is required', 400);
		}

		if (!school_id || typeof school_id !== 'string') {
			throw new AppError('School ID is required', 400);
		}

		const isAvailable = await authService.checkUsernameAvailabilityService(
			username,
			school_id
		);

		return sendResponse(res, 200, {
			username,
			is_available: isAvailable,
			school_id,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 500));
	}
};

export const checkEmailAvailaility = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email } = req.query;
		if (!email || typeof email !== 'string') {
			throw new AppError('Email is required', 400);
		}
		const isAvailable = await authService.checkEmailAvailabilityService(
			email
		);
		return sendResponse(res, 200, { email, is_available: isAvailable });
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 500));
	}
};
