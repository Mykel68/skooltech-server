import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { UserRegistrationData } from "../types/models.types";
import Joi from "joi";

const userRegistrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("Teacher", "Student").required(),
  first_name: Joi.string().max(50).optional(),
  last_name: Joi.string().max(50).optional(),
  school_id: Joi.string().uuid().required(),
});

const userUpdateSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  first_name: Joi.string().max(50).optional(),
  last_name: Joi.string().max(50).optional(),
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

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { error, value } = userUpdateSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const updatedUser = await userService.updateUser(user_id, value);
    sendResponse(res, 200, {
      user_id: updatedUser.user_id,
      username: updatedUser.username,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      role: updatedUser.role,
      school_id: updatedUser.school_id,
      is_approved: updatedUser.is_approved,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 400));
  }
};
