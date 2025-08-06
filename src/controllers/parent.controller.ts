import { Request, Response, NextFunction } from "express";
import {
  childResults,
  getLinkedChildrenOfParent,
  linkParentToStudent,
  parentStats,
} from "../services/parent.service";
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

    const { admission_number, code } = req.body;

    if (!admission_number && !code) {
      throw new AppError("Either admission_number or code is required", 400);
    }

    const linked = await linkParentToStudent({
      parent_user_id: parent_user_id as string,
      student_admission_number: admission_number,
      code,
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

export const getLinkedChildren = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const parent_user_id = req.user?.user_id;
    const school_id = req.user?.school_id;

    const linked = await getLinkedChildrenOfParent({
      parent_user_id: parent_user_id as string,
      school_id: school_id as string,
    });

    sendResponse(res, 200, {
      message: "Student successfully linked to parent",
      children: linked,
    });
  } catch (error: any) {
    next(error);
  }
};

export const overview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parent_user_id = req.user?.user_id;
    const school_id = req.user?.school_id;
    const children = await parentStats({
      parent_user_id: parent_user_id as string,
      school_id: school_id as string,
    });
    sendResponse(res, 200, { children });
  } catch (error: any) {
    next(error);
  }
};

export const getChildrenResults = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parent_user_id = req.user?.user_id;
    const school_id = req.user?.school_id;
    const children = await childResults({
      parent_user_id: parent_user_id as string,
      school_id: school_id as string,
    });
    sendResponse(res, 200, { children });
  } catch (error: any) {
    next(error);
  }
};
