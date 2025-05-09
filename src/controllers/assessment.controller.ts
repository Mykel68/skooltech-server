import { Request, Response } from "express";
import { AssessmentService } from "../services/assessment.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export class AssessmentController {
  private assessmentService: AssessmentService;

  constructor() {
    this.assessmentService = new AssessmentService();
  }

  async createAssessment(req: any, res: Response): Promise<void> {
    const { subject_id } = req.params;
    const { class_id, name, type, date, max_score } = req.body;
    const teacher_id = req.user!.user_id;

    try {
      if (!subject_id || !class_id || !name || !type || !date || !max_score) {
        throw new AppError("All fields are required", 400);
      }

      const assessment = await this.assessmentService.createAssessment(
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
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }

  async getAssessmentsByClassAndSubject(
    req: any,
    res: Response
  ): Promise<void> {
    const { class_id, subject_id } = req.params;
    const school_id = req.user!.school_id;

    try {
      if (!class_id || !subject_id) {
        throw new AppError("Class ID and subject ID are required", 400);
      }

      const assessments =
        await this.assessmentService.getAssessmentsByClassAndSubject(
          class_id,
          subject_id,
          school_id
        );

      sendResponse(
        res,
        200,
        assessments.map((assessment) => ({
          assessment_id: assessment.assessment_id,
          subject_id: assessment.subject_id,
          class_id: assessment.class_id,
          name: assessment.name,
          type: assessment.type,
          date: assessment.date,
          max_score: assessment.max_score,
        }))
      );
    } catch (error: any) {
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }
}
