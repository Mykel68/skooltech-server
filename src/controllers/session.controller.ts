import { Request, Response } from "express";
import * as sessionService from "../services/session.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export const createSession = async (req: Request, res: Response) => {
  const { school_id } = req.params;
  const { name, start_date, end_date } = req.body;

  try {
    if (!school_id || !name || !start_date || !end_date) {
      throw new AppError(
        "School ID, name, start date, and end date are required",
        400
      );
    }

    const session = await sessionService.createSession(
      school_id,
      name,
      new Date(start_date),
      new Date(end_date)
    );

    sendResponse(res, 201, session);
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  const { school_id } = req.params;

  try {
    if (!school_id) {
      throw new AppError("School ID is required", 400);
    }

    const sessions = await sessionService.getSessions(school_id);
    sendResponse(res, 200, sessions);
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
