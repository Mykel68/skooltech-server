import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { UserRegistrationData, UserInstance } from '../types/user.types';
import Joi from 'joi';

const registrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('Student', 'Teacher').required(),
  first_name: Joi.string().max(50).optional(),
  last_name: Joi.string().max(50).optional(),
});

export const loginController = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const token = await authService.login(username, password);
    sendResponse(res, 200, { token });
  } catch (error: any) {
    throw new AppError(error.message, 401);
  }
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const { error, value } = registrationSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const userData: UserRegistrationData = value;
    const school_id = req.params.school_id;
    const user: UserInstance = await userService.registerUser(userData, school_id);
    sendResponse(res, 201, { user_id: user.user_id, username: user.username, email: user.email });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 400);
  }
};