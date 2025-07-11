import { NextFunction } from "express";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createStudentLinkCode } from "../services/student_link.service";

export const generateStudentLinkCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      throw new AppError("Student ID and code are required", 400);
    }

    const student = await createStudentLinkCode(student_id);

    sendResponse(res, 201, {
      message: "Grading settings created successfully",
      data: student,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
