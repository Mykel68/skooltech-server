import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { UserRegistrationData } from '../types/models.types';
import Joi from 'joi';
import { AuthRequest } from '../middlewares/auth.middleware';
import { validateUUID } from '../utils/validation.util';
import User from '../models/user.model';

const userRegistrationSchema = Joi.object({
	username: Joi.string().min(3).max(30).required(),
	password: Joi.string().min(8).required(),
	email: Joi.string().email().required(),
	role: Joi.string().valid('Teacher', 'Student').required(),
	first_name: Joi.string().max(50).optional(),
	last_name: Joi.string().max(50).optional(),
	school_id: Joi.string().uuid().required(),
});

const userUpdateSchema = Joi.object({
	username: Joi.string().min(3).max(30).optional(),
	email: Joi.string().email().optional(),
	first_name: Joi.string().max(50).optional(),
	last_name: Joi.string().max(50).optional(),
	gender: Joi.string().valid('Male', 'Female').optional(),
});

const teacherVerifySchema = Joi.object({
	is_approved: Joi.boolean().required(),
});

export const registerUserController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { error, value } = userRegistrationSchema.validate(req.body);
		if (error) throw new AppError(error.details[0].message, 400);

		const userData: UserRegistrationData = value;
		const user = await userService.registerUser(userData);
		sendResponse(res, 201, {
			user_id: user.user_id,
			username: user.username,
			email: user.email,
			role: user.role,
			school_id: user.school_id,
			is_approved: user.is_approved,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const getUserController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { user_id } = req.params;
		const user = await userService.getUserById(user_id);
		sendResponse(res, 200, {
			user_id: user.user_id,
			username: user.username,
			email: user.email,
			first_name: user.first_name,
			last_name: user.last_name,
			role: user.role,
			school_id: user.school_id,
			is_approved: user.is_approved,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 404));
	}
};

export const updateUserController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { user_id } = req.params;
		const { error, value } = userUpdateSchema.validate(req.body);
		console.log('value', value);
		if (error) throw new AppError(error.details[0].message, 400);

		const updatedUser = await userService.updateUser(user_id, value);
		sendResponse(res, 200, {
			user_id: updatedUser.user_id,
			username: updatedUser.username,
			email: updatedUser.email,
			first_name: updatedUser.first_name,
			last_name: updatedUser.last_name,
			role: updatedUser.role,
			gender: updatedUser.gender,
			school_id: updatedUser.school_id,
			is_approved: updatedUser.is_approved,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const getTeacherByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { user_id } = req.params;
		const teacher = await userService.getTeacherById(user_id);
		sendResponse(res, 200, {
			user_id: teacher.user_id,
			username: teacher.username,
			email: teacher.email,
			first_name: teacher.first_name,
			last_name: teacher.last_name,
			role: teacher.role,
			school_id: teacher.school_id,
			is_approved: teacher.is_approved,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 404));
	}
};

export const getTeachersBySchoolController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { school_id } = req.params;
		const teachers = await userService.getTeachersBySchool(school_id);
		sendResponse(
			res,
			200,
			teachers.map((teacher) => ({
				user_id: teacher.user_id,
				username: teacher.username,
				email: teacher.email,
				first_name: teacher.first_name,
				last_name: teacher.last_name,
				role: teacher.role,
				school_id: teacher.school_id,
				is_approved: teacher.is_approved,
			}))
		);
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 404));
	}
};

export const updateTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { user_id } = req.params;
		const { error, value } = userUpdateSchema.validate(req.body);
		if (error) throw new AppError(error.details[0].message, 400);

		const updatedTeacher = await userService.updateTeacher(user_id, value);
		sendResponse(res, 200, {
			user_id: updatedTeacher.user_id,
			username: updatedTeacher.username,
			email: updatedTeacher.email,
			first_name: updatedTeacher.first_name,
			last_name: updatedTeacher.last_name,
			role: updatedTeacher.role,
			school_id: updatedTeacher.school_id,
			is_approved: updatedTeacher.is_approved,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const verifyTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { user_id } = req.params;
		const { error, value } = teacherVerifySchema.validate(req.body);
		if (error) throw new AppError(error.details[0].message, 400);

		const updatedTeacher = await userService.verifyTeacher(
			user_id,
			value.is_approved
		);
		sendResponse(res, 200, {
			user_id: updatedTeacher.user_id,
			username: updatedTeacher.username,
			email: updatedTeacher.email,
			first_name: updatedTeacher.first_name,
			last_name: updatedTeacher.last_name,
			role: updatedTeacher.role,
			school_id: updatedTeacher.school_id,
			is_approved: updatedTeacher.is_approved,
		});
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const deleteTeacherController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { user_id } = req.params;
		await userService.deleteTeacher(user_id);
		sendResponse(res, 200, { message: 'Teacher deleted successfully' });
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const getStudentsBySchoolController = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { school_id } = req.params;

	try {
		const students = await userService.getStudentsBySchool(school_id);
		const responseData = students.map((student) => ({
			user_id: student.user_id,
			username: student.username,
			email: student.email,
			first_name: student.first_name,
			last_name: student.last_name,
			role: student.role,
			school_id: student.school_id,
			is_approved: student.is_approved,
		}));
		sendResponse(res, 200, responseData);
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

export const getStudentsBySchoolControllers = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { school_id } = req.params;
	try {
		if (!school_id) {
			throw new AppError('Invalid school ID', 400);
		}

		const students = await userService.getStudentBySchool(school_id);
		sendResponse(res, 200, students);
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};

//delete User by id
export const deleteUserController = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { user_id } = req.params;
		await userService.deleteUser(user_id);
		sendResponse(res, 200, { message: 'User deleted successfully' });
	} catch (error: any) {
		next(new AppError(error.message, error.statusCode || 400));
	}
};
