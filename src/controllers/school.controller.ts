import { Request, Response, NextFunction } from "express";
import * as schoolService from "../services/school.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { SchoolInstance, SchoolAttributes } from "../types/models.types";
import Joi from "joi";

const schoolCreationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  address: Joi.string().max(255).optional(),
});

export const createSchoolController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Restrict to superusers or admins (adjust role as needed)
    if (req.user?.role !== "Admin")
      throw new AppError("Unauthorized: Only admins can create schools", 403);

    // Validate request body
    const { error, value } = schoolCreationSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const schoolData: SchoolAttributes = value;
    const school: SchoolInstance = await schoolService.createSchool(schoolData);
    sendResponse(res, 201, {
      school_id: school.school_id,
      name: school.name,
      address: school.address,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 400));
  }
};
