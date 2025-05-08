import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export interface AuthRequest extends Request {
  user?: {
    user_id: string;
    school_id: string;
    school_name: string;
    school_code: string | null;
    school_image: string | null;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    sendResponse(res, 401, { message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
      school_id: string;
      school_name: string;
      school_code: string | null;
      school_image: string | null;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    sendResponse(res, 401, { message: "Unauthorized: Invalid token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendResponse(res, 403, {
        message: "Forbidden: Insufficient permissions",
      });
      return;
    }
    next();
  };
};

export const restrictToSchool = () => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendResponse(res, 401, { message: "Unauthorized: No user data" });
      return;
    }
    const schoolIdFromParams = req.params.school_id || req.body.school_id;
    if (schoolIdFromParams && req.user.school_id !== schoolIdFromParams) {
      sendResponse(res, 403, {
        message: "Forbidden: Cannot access resources from another school",
      });
      return;
    }
    next();
  };
};

export const verify_X_API_KEY = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let apiKeyHeader = req.headers["x-api-key"];

    // Ensure apiKeyHeader is a string
    if (Array.isArray(apiKeyHeader)) {
      apiKeyHeader = apiKeyHeader[0];
    }

    if (!apiKeyHeader) {
      sendResponse(res, 401, { message: "Unauthorized: No API key provided" });
      return;
    }

    // Extract the actual API key (if prefixed with 'Bearer ')
    const apiKey = apiKeyHeader.startsWith("Bearer ")
      ? apiKeyHeader.split(" ")[1]
      : apiKeyHeader;

    if (apiKey !== process.env.X_API_KEY!) {
      sendResponse(res, 401, { message: "Unauthorized: Invalid API key" });
      return;
    }

    next();
  } catch (error: any) {
    throw new AppError(error.message, 401);
  }
};
