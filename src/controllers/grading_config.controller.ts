import { Request, Response } from "express";
import * as gradingConfigService from "../services/grading_config.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

/**
 * Handle grading config creation request
 */
export const createGradingConfigHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { school_id } = req.params;
  const { assessment_type, weight } = req.body;

  try {
    if (!school_id || !assessment_type || weight === undefined) {
      throw new AppError(
        "School ID, assessment type, and weight are required",
        400
      );
    }

    const config = await gradingConfigService.createGradingConfig(
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
};

/**
 * Handle grading config update request
 */
export const updateGradingConfigHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { config_id } = req.params;
  const { weight } = req.body;

  try {
    if (!config_id || weight === undefined) {
      throw new AppError("Config ID and weight are required", 400);
    }

    const config = await gradingConfigService.updateGradingConfig(
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
};
