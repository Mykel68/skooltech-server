import { NextFunction, Request, Response } from "express";
import { createSuperAdmin, getAppData } from "../services/super_admin.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendResponse } from "../utils/response.util";

export const createSuperAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const admin = await createSuperAdmin({ username, email, password });

    sendResponse(res, 201, {
      message: "Super admin created successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      sendResponse(res, 401, { message: "Unauthorized: No user data" });
    }
    const stats = await getAppData(userId!);
    sendResponse(res, 200, stats);
  } catch (error) {
    next(error);
  }
};
