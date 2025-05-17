import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import * as userService from "../services/user.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { UserRegistrationData } from "../types/models.types";
import Joi from "joi";

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const registrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("Student", "Teacher").required(),
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
  role: Joi.string().valid("Student", "Teacher", "Admin", "Parent").required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),

  // Conditional class_id rule
  class_id: Joi.when("role", {
    is: "Student",
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
      throw new AppError("School ID is required", 400);
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
      throw new AppError("School ID is required", 400);
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
    console.log("user", user);

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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id } = req.params;
    if (!school_id) {
      throw new AppError("School ID is required", 400);
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
    console.log("registerTeacherStudent", error);
    next(new AppError(error.message, error.statusCode || 400));
  }
};
