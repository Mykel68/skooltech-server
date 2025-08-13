import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { Session, Term } from "../models";

export interface AuthRequest extends Request {
  user?: {
    user_id: string;
    school_id: string;
    school_name: string;
    school_code: string | null;
    school_image: string | null;
    role: string[]; // changed from 'roles' to 'role'
    role_ids?: number[];
  };
  session_id?: string;
  term_id?: string;
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
      role: string[]; // ✅ correct: array of roles
      role_ids?: number[];
      session_id: string;
    };

    req.user = decoded;
    req.session_id = decoded.session_id;
    next();
  } catch (error) {
    sendResponse(res, 401, { message: "Unauthorized: Invalid token" });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRoles = req.user?.role || [];

    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
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
    const schoolIdFromParams = req.params.school_id || req.params.schoolId;

    if (!req.user) {
      sendResponse(res, 401, { message: "Unauthorized: No user data" });
      return;
    }

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
      sendResponse(res, 401, {
        message: "Unauthorized: No API key provided",
      });
      return;
    }

    // Extract the actual API key (if prefixed with 'Bearer ')
    const apiKey = apiKeyHeader.startsWith("Bearer ")
      ? apiKeyHeader.split(" ")[1]
      : apiKeyHeader;

    if (apiKey !== process.env.X_API_KEY!) {
      sendResponse(res, 401, {
        message: "Unauthorized: Invalid API key",
      });
      return;
    }

    next();
  } catch (error: any) {
    throw new AppError(error.message, 401);
  }
};

export async function attachCurrentSessionTerm(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const school_id = req.user?.school_id;
  if (!school_id) return next(); // or error

  const session = await Session.findOne({
    where: { school_id, is_active: true },
  });
  if (session) req.session_id = session.session_id;

  const term = await Term.findOne({
    where: { session_id: session?.session_id, is_active: true },
  });
  if (term) req.term_id = term.term_id;

  console.log("Session:", req.session_id, "Term:", req.term_id);

  return next();
}

// export const restrictToSession = () => {
//   return async (req: AuthRequest, res: Response, next: NextFunction) => {
//     let session_id =
//       req.params.session_id || req.body.session_id || req.query.session_id;

//     if (session_id && !validateUUID(session_id)) {
//       throw new AppError("Invalid session ID", 400);
//     }

//     if (!session_id) {
//       // Infer current session
//       const currentDate = new Date();
//       const session = await Session.findOne({
//         where: {
//           school_id: req.user!.school_id,
//           start_date: { [Op.lte]: currentDate },
//           end_date: { [Op.gte]: currentDate },
//         },
//       });

//       if (!session) {
//         throw new AppError("No active session found for this school", 400);
//       }
//       session_id = session.session_id;
//     }

//     const session = await Session.findOne({
//       where: { session_id, school_id: req.user!.school_id },
//     });

//     if (!session) {
//       throw new AppError(
//         "Session not found or does not belong to this school",
//         404
//       );
//     }

//     req.session = session;
//     next();
//   };
// };
