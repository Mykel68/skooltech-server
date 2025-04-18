import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { UserInstance, UserCreationData } from '../types/user.types';
import Joi from 'joi';

const userCreationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('Admin', 'Teacher', 'Student', 'Parent').required(),
  first_name: Joi.string().max(50).optional(),
  last_name: Joi.string().max(50).optional(),
});

export const createUserController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'Admin') throw new AppError('Unauthorized', 403);

    // Validate request body
    const { error, value } = userCreationSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    // Construct UserCreationData object
    const userData: UserCreationData = {
      ...value,
      school_id: req.user.school_id,
    };

    const user: UserInstance = await userService.createUser(userData);
    sendResponse(res, 201, user);
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 400));
  }
};