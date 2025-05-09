import { Request, Response } from "express";
import { ClassService } from "../services/class.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export class ClassController {
  private classService: ClassService;

  constructor() {
    this.classService = new ClassService();
  }

  async createClass(req: any, res: Response): Promise<void> {
    const { school_id } = req.params;
    const { name, grade_level } = req.body;

    try {
      if (!school_id || !name) {
        throw new AppError("School ID and name are required", 400);
      }

      const classInstance = await this.classService.createClass(
        school_id,
        name,
        grade_level
      );

      sendResponse(res, 201, {
        class_id: classInstance.class_id,
        school_id: classInstance.school_id,
        name: classInstance.name,
        grade_level: classInstance.grade_level,
      });
    } catch (error: any) {
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }

  async getClass(req: any, res: Response): Promise<void> {
    const { class_id } = req.params;
    const school_id = req.user!.school_id;

    try {
      if (!class_id) {
        throw new AppError("Class ID is required", 400);
      }

      const classInstance = await this.classService.getClass(
        class_id,
        school_id
      );

      sendResponse(res, 200, {
        class_id: classInstance.class_id,
        school_id: classInstance.school_id,
        name: classInstance.name,
        grade_level: classInstance.grade_level,
      });
    } catch (error: any) {
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }
}
