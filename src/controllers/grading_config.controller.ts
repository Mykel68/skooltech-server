import { Request, Response } from "express";
import { GradingConfigService } from "../services/grading_config.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export class GradingConfigController {
  private gradingConfigService: GradingConfigService;

  constructor() {
    this.gradingConfigService = new GradingConfigService();
  }

  async createGradingConfig(req: any, res: Response): Promise<void> {
    const { school_id } = req.params;
    const { assessment_type, weight } = req.body;

    try {
      if (!school_id || !assessment_type || weight === undefined) {
        throw new AppError(
          "School ID, assessment type, and weight are required",
          400
        );
      }

      const config = await this.gradingConfigService.createGradingConfig(
        school_id,
        assessment_type,
        weight
      );

      sendResponse(res, 201, {
        config_id: config.config_id,
        school_id: config.school_id,
        assessment_type: config.assessment_type,
        weight: config.weight,
      });
    } catch (error: any) {
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }

  async updateGradingConfig(req: any, res: Response): Promise<void> {
    const { config_id } = req.params;
    const { weight } = req.body;

    try {
      if (!config_id || weight === undefined) {
        throw new AppError("Config ID and weight are required", 400);
      }

      const config = await this.gradingConfigService.updateGradingConfig(
        config_id,
        weight
      );

      sendResponse(res, 200, {
        config_id: config.config_id,
        school_id: config.school_id,
        assessment_type: config.assessment_type,
        weight: config.weight,
      });
    } catch (error: any) {
      sendResponse(res, error.statusCode || 500, {
        message: error.message || "Internal server error",
      });
    }
  }
}
