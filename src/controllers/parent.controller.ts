import { Request, Response, NextFunction } from "express";
import { linkParentToStudent } from "../services/parent.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { AuthRequest } from "../middlewares/auth.middleware";

export const linkChildToParent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const parent_user_id = req.user?.user_id;
    const school_id = req.user?.school_id;

    const { admission_number } = req.body;
    if (!admission_number)
      throw new AppError("Admission number is required", 400);

    const linked = await linkParentToStudent({
      parent_user_id: parent_user_id as string,
      student_admission_number: admission_number,
      school_id: school_id as string,
    });

    sendResponse(res, 200, {
      message: "Student successfully linked to parent",
      student: linked,
    });
  } catch (error: any) {
    next(error);
  }
};
