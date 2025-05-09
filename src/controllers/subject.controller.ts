import { Request, Response } from "express";
import { SubjectService } from "../services/subject.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export class SubjectController {
  private subjectService: SubjectService;

  constructor() {
    this.subjectService = new SubjectService();
  }

  async createSubject(req: any, res: Response): Promise<void> {
    const { class_id } = req.params;
    const { name } = req.body;
    const teacher_id = req.user!.user_id;

    try {
      if (!class_id || !name) {
        throw new AppError("Class ID and name are required", 400);
      }

      const subject = await this.subjectService.createSubject(
        class_id,
        teacher_id,
        name
      );

      sendResponse(res, 201, {
        subject_id: subject.subject_id,
        school_id: subject.school_id,
        class_id: subject.class_id,
        teacher_id: subject.teacher_id,
        name: subject.name,
        is_approved: subject.is_approved,
      });
    } catch (error: any) {
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }

  async approveSubject(req: any, res: Response): Promise<void> {
    const { subject_id } = req.params;

    try {
      if (!subject_id) {
        throw new AppError("Subject ID is required", 400);
      }

      const subject = await this.subjectService.approveSubject(subject_id);

      sendResponse(res, 200, {
        subject_id: subject.subject_id,
        school_id: subject.school_id,
        class_id: subject.class_id,
        teacher_id: subject.teacher_id,
        name: subject.name,
        is_approved: subject.is_approved,
      });
    } catch (error: any) {
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }

  async getSubjectsByClass(req: any, res: Response): Promise<void> {
    const { class_id } = req.params;
    const school_id = req.user!.school_id;

    try {
      if (!class_id) {
        throw new AppError("Class ID is required", 400);
      }

      const subjects = await this.subjectService.getSubjectsByClass(
        class_id,
        school_id
      );

      sendResponse(
        res,
        200,
        subjects.map((subject) => ({
          subject_id: subject.subject_id,
          school_id: subject.school_id,
          class_id: subject.class_id,
          teacher_id: subject.teacher_id,
          name: subject.name,
          is_approved: subject.is_approved,
        }))
      );
    } catch (error: any) {
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }
}
