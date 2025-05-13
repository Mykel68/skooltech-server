import { Request, Response } from "express";
import * as termService from "../services/term.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createTerm = async (req: AuthRequest, res: Response) => {
  const { school_id, session_id } = req.params;
  const { name, start_date, end_date } = req.body;

  try {
    if (!school_id || !session_id || !name || !start_date || !end_date) {
      throw new AppError(
        "School ID, session ID, name, start date, and end date are required",
        400
      );
    }

    const term = await termService.createTerm(
      school_id,
      session_id,
      name,
      new Date(start_date),
      new Date(end_date)
    );

    sendResponse(res, 201, {
      term_id: term.term_id,
      school_id: term.school_id,
      session_id: term.session_id,
      name: term.name,
      start_date: term.start_date,
      end_date: term.end_date,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const updateTerm = async (req: AuthRequest, res: Response) => {
  const { term_id } = req.params;
  const { name, start_date, end_date } = req.body;

  try {
    if (!term_id || !name || !start_date || !end_date) {
      throw new AppError(
        "Term ID, name, start date, and end date are required",
        400
      );
    }

    const term = await termService.updateTerm(
      term_id,
      name,
      new Date(start_date),
      new Date(end_date)
    );

    sendResponse(res, 200, {
      term_id: term.term_id,
      school_id: term.school_id,
      session_id: term.session_id,
      name: term.name,
      start_date: term.start_date,
      end_date: term.end_date,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const deleteTerm = async (req: AuthRequest, res: Response) => {
  const { term_id } = req.params;

  try {
    if (!term_id) {
      throw new AppError("Term ID is required", 400);
    }

    await termService.deleteTerm(term_id);
    sendResponse(res, 204, {});
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const getTerms = async (req: AuthRequest, res: Response) => {
  const { session_id } = req.params;
  const school_id = req.user!.school_id;

  try {
    const terms = await termService.getTerms(session_id, school_id);

    sendResponse(
      res,
      200,
      terms.map((term) => ({
        term_id: term.term_id,
        school_id: term.school_id,
        session_id: term.session_id,
        name: term.name,
        start_date: term.start_date,
        end_date: term.end_date,
      }))
    );
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
