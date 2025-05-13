import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import * as assessmentService from "../services/assessment.service";
import { AuthRequest } from "../middlewares/auth.middleware";

// Define schema for validation
const createAssessmentSchema = Joi.object({
  class_id: Joi.string().uuid().required(),
  term_id: Joi.string().uuid().required(),
  session_id: Joi.string().uuid().optional(),
  name: Joi.string().required(),
  type: Joi.string().valid("Exam", "Quiz", "Assignment").required(),
  date: Joi.date().required(),
  max_score: Joi.number().positive().required(),
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
    const { class_id, term_id, session_id, name, type, date, max_score } =
      value;

    const assessment = await assessmentService.createAssessment(
      subject_id,
      class_id,
      term_id,
      teacher_id,
      name,
      type,
      new Date(date),
      max_score,
      session_id
    );

    sendResponse(res, 201, {
      assessment_id: assessment.assessment_id,
      subject_id: assessment.subject_id,
      class_id: assessment.class_id,
      term_id: assessment.term_id,
      name: assessment.name,
      type: assessment.type,
      date: assessment.date,
      max_score: assessment.max_score,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 400));
  }
};

// Define schema for get assessments
const getAssessmentsSchema = Joi.object({
  class_id: Joi.string().uuid().required(),
  subject_id: Joi.string().uuid().required(),
  term_id: Joi.string().uuid().required(),
  session_id: Joi.string().uuid().optional(),
});

// Fetch assessments by class and subject controller
export const getAssessmentsByClassAndSubjectController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { class_id, subject_id, term_id, session_id } = req.params;
    const { error, value } = getAssessmentsSchema.validate({
      class_id,
      subject_id,
      term_id,
      session_id,
    });
    if (error) throw new AppError(error.details[0].message, 400);

    const school_id = req.user!.school_id;

    const assessments = await assessmentService.getAssessmentsByClassAndSubject(
      value.class_id,
      value.subject_id,
      value.term_id,
      school_id,
      value.session_id
    );

    sendResponse(
      res,
      200,
      assessments.map((a) => ({
        assessment_id: a.assessment_id,
        subject_id: a.subject_id,
        class_id: a.class_id,
        term_id: a.term_id,
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
