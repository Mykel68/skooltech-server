import { Response, NextFunction } from "express";
import { getTeachersByClass } from "../services/teacher.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getTeachers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized: No user data", 401);
    }

    const { school_id, class_id } = req.params;
    const student_id = req.user.user_id;

    console.log("Get Teachers Request:", { school_id, class_id, student_id });

    const teachers = await getTeachersByClass(school_id, student_id, class_id);

    sendResponse(res, 200, {
      message: "Teachers retrieved successfully",
      data: teachers,
    });
  } catch (error: any) {
    console.error("Get Teachers Error:", error.message, {
      params: req.params,
      errorDetails: error,
    });
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
