import { Request, Response, NextFunction } from "express";
import { getDashboardStats } from "../services/dashboard.service";
import { AppError } from "../utils/error.util";
import { sendResponse } from "../utils/response.util";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getDashboardStatsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id } = req.params;
    const session_id = (req.query.session_id as string) || req.session_id;
    const term_id = (req.query.term_id as string) || req.term_id;

    const stats = await getDashboardStats(school_id, session_id!, term_id!);
    sendResponse(res, 200, stats);
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};
