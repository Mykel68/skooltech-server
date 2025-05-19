import { Response, NextFunction } from "express";
import { createGradingSetting } from "../services/grading_setting.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { AuthRequest } from "../middlewares/auth.middleware";

export const setGradingSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized: No user data", 401);
    }

    const { school_id, class_id } = req.params;
    const { components } = req.body;
    const teacher_id = req.user.user_id;

    const gradingSetting = await createGradingSetting(
      school_id,
      class_id,
      teacher_id,
      components
    );

    sendResponse(res, 201, {
      message: "Grading settings created successfully",
      data: gradingSetting,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
