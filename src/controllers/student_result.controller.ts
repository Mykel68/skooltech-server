import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getStudentResult } from "../services/student_result.service";
import { AppError } from "../utils/error.util";
import { sendResponse } from "../utils/response.util";

export const getStudentResultHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const student_id = req.user?.user_id;
    const school_id = req.user?.school_id;
    if (!student_id || !school_id) throw new AppError("Unauthorized", 403);

    const result = await getStudentResult(student_id, school_id);
    sendResponse(res, 200, result);
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
