import { Request, Response } from "express";
import * as gradeScaleService from "../services/grade_scale.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

/**
 * Handle grade scale creation request
 */
export const createGradeScaleHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { school_id } = req.params;
  const { letter_grade, min_score, max_score } = req.body;

  try {
    if (
      !school_id ||
      !letter_grade ||
      min_score === undefined ||
      max_score === undefined
    ) {
      throw new AppError(
        "School ID, letter grade, min score, and max score are required",
        400
      );
    }

    const scale = await gradeScaleService.createGradeScale(
      school_id,
      letter_grade,
      min_score,
      max_score
    );

    sendResponse(res, 201, {
      scale_id: scale.scale_id,
      school_id: scale.school_id,
      letter_grade: scale.letter_grade,
      min_score: scale.min_score,
      max_score: scale.max_score,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Handle grade scale update request
 */
export const updateGradeScaleHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { scale_id } = req.params;
  const { letter_grade, min_score, max_score } = req.body;

  try {
    if (
      !scale_id ||
      !letter_grade ||
      min_score === undefined ||
      max_score === undefined
    ) {
      throw new AppError(
        "Scale ID, letter grade, min score, and max score are required",
        400
      );
    }

    const scale = await gradeScaleService.updateGradeScale(
      scale_id,
      letter_grade,
      min_score,
      max_score
    );

    sendResponse(res, 200, {
      scale_id: scale.scale_id,
      school_id: scale.school_id,
      letter_grade: scale.letter_grade,
      min_score: scale.min_score,
      max_score: scale.max_score,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
