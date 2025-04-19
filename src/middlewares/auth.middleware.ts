import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export interface AuthRequest extends Request {
  user?: { user_id: string; school_id: string; role: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
      school_id: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
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
      apiKeyHeader = apiKeyHeader[0]; // Use the first value if it's an array
    }

    if (!apiKeyHeader) {
      sendResponse(res, 401, "Unauthorized: No API key provided");
      return;
    }

    // Extract the actual API key (if prefixed with 'Bearer ')
    const apiKey = apiKeyHeader.startsWith("Bearer ")
      ? apiKeyHeader.split(" ")[1]
      : apiKeyHeader;

    if (apiKey !== process.env.X_API_KEY!) {
      sendResponse(res, 401, "Unauthorized: Invalid API key");
      return;
    }

    next();
  } catch (error: any) {
    console.log(error);
    throw new AppError(error.message, 401);
  }
};
