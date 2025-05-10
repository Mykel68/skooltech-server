import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import Joi from "joi";
import * as assessmentService from "../services/assessment.service";
import { AuthRequest } from "../middlewares/auth.middleware";

// Define schema for validation
const createAssessmentSchema = Joi.object({
  class_id: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string().required(),
  date: Joi.date().required(),
  max_score: Joi.number().required(),
});

// Create a new assessment controller
export const createAssessmentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subject_id } = req.params;
    if (!subject_id) throw new AppError("Subject ID is required", 400);

    const { error, value } = createAssessmentSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const teacher_id = req.user!.user_id;
    const { class_id, name, type, date, max_score } = value;

    const assessment = await assessmentService.createAssessment(
      subject_id,
      class_id,
      teacher_id,
      name,
      type,
      new Date(date),
      max_score
    );

    sendResponse(res, 201, {
      assessment_id: assessment.assessment_id,
      subject_id: assessment.subject_id,
      class_id: assessment.class_id,
      name: assessment.name,
      type: assessment.type,
      date: assessment.date,
      max_score: assessment.max_score,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 400));
  }
};

// Fetch assessments by class and subject controller
export const getAssessmentsByClassAndSubjectController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { class_id, subject_id } = req.params;
    if (!class_id || !subject_id) {
      throw new AppError("Class ID and Subject ID are required", 400);
    }

    const school_id = req.user!.school_id;

    const assessments = await assessmentService.getAssessmentsByClassAndSubject(
      class_id,
      subject_id,
      school_id
    );

    sendResponse(
      res,
      200,
      assessments.map((a) => ({
        assessment_id: a.assessment_id,
        subject_id: a.subject_id,
        class_id: a.class_id,
        name: a.name,
        type: a.type,
        date: a.date,
        max_score: a.max_score,
      }))
    );
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 400));
  }
};
