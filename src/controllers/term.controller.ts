import { Response, NextFunction } from "express";
import Joi from "joi";
import * as termService from "../services/term.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validateUUID } from "../utils/validation.util";

// Schema for creating a term
const createTermSchema = Joi.object({
  name: Joi.string().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref("start_date")).required(),
});

// Schema for updating a term
const updateTermSchema = Joi.object({
  name: Joi.string().allow("").optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

export const createTerm = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role_name !== "Admin") {
      throw new AppError("Only admins can create terms", 403);
    }

    const { school_id, session_id } = req.params;
    const { name, start_date, end_date } = req.body;

    const { error, value } = createTermSchema.validate({
      name,
      start_date,
      end_date,
    });
    if (error) throw new AppError(error.details[0].message, 400);

    const term = await termService.createTerm(
      school_id,
      session_id,
      value.name,
      new Date(value.start_date),
      new Date(value.end_date)
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

export const updateSchoolTerm = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, session_id, term_id } = req.params;

    if (req.user?.role_name !== "Admin") {
      throw new AppError("Only admins can update terms", 403);
    }

    if (
      !validateUUID(school_id) ||
      !validateUUID(session_id) ||
      !validateUUID(term_id)
    ) {
      throw new AppError("Invalid school, session, or term ID", 400);
    }

    // Only pick the keys that exist in body
    const updates: any = {};
    const allowedFields = ["name", "start_date", "end_date", "is_active"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] =
          field.endsWith("_date") && req.body[field]
            ? new Date(req.body[field])
            : req.body[field];
      }
    }

    // Validate using Joi schema (with partials allowed)
    const { error, value } = updateTermSchema.validate(updates);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const term = await termService.updateTerm({
      school_id,
      session_id,
      term_id,
      updates: value,
    });

    sendResponse(res, 200, {
      message: "Term updated successfully",
      term: {
        term_id: term.term_id,
        name: term.name,
        session_id: term.session_id,
        school_id: term.school_id,
        start_date: term.start_date,
        end_date: term.end_date,
        is_active: term.is_active,
      },
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const getTerms = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized: No user data", 401);
    }

    const { session_id } = req.params;
    const school_id = req.user.school_id;

    const terms = await termService.getTerms(session_id, school_id);

    sendResponse(
      res,
      200,
      terms.map((term) => ({
        term_id: term.term_id,
        school_id: term.school_id,
        session_id: term.session_id,
        name: term.name,
        is_active: term.is_active,
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

export const getSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized: No user data", 401);
    }

    const { school_id } = req.params;

    console.log("Get Sessions Request:", { school_id });

    const sessions = await termService.getSchoolSessions(school_id);

    sendResponse(res, 200, {
      message: "School sessions retrieved successfully",
      data: sessions,
    });
  } catch (error: any) {
    console.error("Get Sessions Error:", error.message, {
      params: req.params,
      errorDetails: error,
    });
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
