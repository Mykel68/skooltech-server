import { Request, Response, NextFunction } from "express";
import * as schoolService from "../services/school.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { SchoolRegistrationData } from "../types/models.types";
import Joi from "joi";

const schoolRegistrationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  school_image: Joi.string().uri().allow(null).optional(),
  phone_number: Joi.string().min(7).max(15).allow(null).optional(),
  school_code: Joi.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9-]+$/)
    .allow(null, "")
    .optional(),
  admin_username: Joi.string().min(3).max(30).required(),
  admin_password: Joi.string().min(8).required(),
  admin_email: Joi.string().email().required(),
  admin_first_name: Joi.string().max(50).optional(),
  admin_last_name: Joi.string().max(50).optional(),
  gender: Joi.string().valid("Male", "Female").required(),
});

const schoolUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  address: Joi.string().max(255).optional(),
  school_image: Joi.string().uri().allow(null).optional(),
  phone_number: Joi.string().min(7).max(15).allow(null).optional(),
  school_code: Joi.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9-]+$/)
    .allow(null, "")
    .optional(),
  motto: Joi.string().optional(),
});

export const createSchoolController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = schoolRegistrationSchema.validate(req.body);
    console.log("Hi");
    if (error) throw new AppError(error.details[0].message, 400);

    const schoolData: SchoolRegistrationData = value;
    const { school, admin } = await schoolService.createSchool(schoolData);
    sendResponse(res, 201, {
      school: {
        school_id: school.school_id,
        name: school.name,
        school_image: school.school_image,
        phone_number: school.phone_number,
        school_code: school.school_code,
      },
      admin: {
        user_id: admin.user_id,
        username: admin.username,
        email: admin.email,
        gender: admin.gender,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 400));
  }
};

export const getSchoolByCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { school_code } = req.params;
    const school = await schoolService.getSchoolByCode(school_code);
    sendResponse(res, 200, {
      school_id: school.school_id,
      name: school.name,
      address: school.address,
      school_image: school.school_image,
      phone_number: school.phone_number,
      school_code: school.school_code,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 404));
  }
};

export const getSchoolByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { school_id } = req.params;
    const school = await schoolService.getSchoolById(school_id);
    sendResponse(res, 200, {
      school_id: school.school_id,
      name: school.name,
      address: school.address,
      school_image: school.school_image,
      phone_number: school.phone_number,
      school_code: school.school_code,
      motto: school.motto,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 404));
  }
};

export const updateSchoolController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { school_id } = req.params;
    const { error, value } = schoolUpdateSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const updatedSchool = await schoolService.updateSchool(school_id, value);
    sendResponse(res, 200, {
      school_id: updatedSchool.school_id,
      name: updatedSchool.name,
      address: updatedSchool.address,
      school_image: updatedSchool.school_image,
      phone_number: updatedSchool.phone_number,
      school_code: updatedSchool.school_code,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 400));
  }
};
