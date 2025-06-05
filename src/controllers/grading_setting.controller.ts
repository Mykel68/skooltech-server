import { Response, NextFunction } from "express";
import {
  createGradingSetting,
  deleteGradingSetting,
  getGradingSetting,
  updateGradingSetting,
} from "../services/grading_setting.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { AuthRequest } from "../middlewares/auth.middleware";

export const setGradingSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, class_id, subject_id } = req.params;
    if (!req.user) throw new AppError("Unauthorized", 401);
    const teacher_id = req.user.user_id;
    const { components } = req.body;

    const gradingSetting = await createGradingSetting(
      school_id,
      class_id,
      subject_id,
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

export const getGradingSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, class_id, subject_id } = req.params;
    if (!req.user) throw new AppError("Unauthorized", 401);
    const teacher_id = req.user.user_id;

    const gradingSetting = await getGradingSetting(
      school_id,
      class_id,
      subject_id,
      teacher_id
    );

    sendResponse(res, 200, {
      message: "Grading settings retrieved successfully",
      data: gradingSetting,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const updateGradingSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, class_id, subject_id } = req.params;
    if (!req.user) throw new AppError("Unauthorized", 401);
    const teacher_id = req.user.user_id;
    const { components } = req.body;

    const updated = await updateGradingSetting(
      school_id,
      class_id,
      subject_id,
      teacher_id,
      components
    );

    sendResponse(res, 200, {
      message: "Grading settings updated successfully",
      data: updated,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const deleteGradingSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, class_id, subject_id } = req.params;
    if (!req.user) throw new AppError("Unauthorized", 401);
    const teacher_id = req.user.user_id;

    await deleteGradingSetting(school_id, class_id, subject_id, teacher_id);

    sendResponse(res, 200, {
      message: "Grading settings deleted successfully",
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
