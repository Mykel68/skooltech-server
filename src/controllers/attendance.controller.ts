import { Request, Response, NextFunction } from "express";
import {
  getAttendance,
  getAttendanceSummary,
  getClassAttendance,
  getTeacherClassStudentsAttendanceReport,
  getTodaysAttendanceForClass,
  markStudentDailyAttendance,
  recordAttendance,
  recordBulkAttendance,
} from "../services/attendnce.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { calculateTotalSchoolDaysFromTerm } from "../utils/date.util";
import { AuthRequest } from "../middlewares/auth.middleware";

export const recordStudentAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id } = req.params;
    const { student_id, class_id, term_id, session_id, days_present } =
      req.body;

    const data = await recordAttendance(
      school_id,
      student_id,
      class_id,
      term_id,
      session_id,
      days_present
    );

    res.status(200).json({ message: "Attendance recorded", data });
  } catch (err) {
    next(err);
  }
};

export const markDailyAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      student_id,
      class_id,
      session_id,
      term_id,
      school_id,
      date,
      present,
    } = req.body;

    // console.log(req.body);

    const data = await markStudentDailyAttendance({
      student_id,
      class_id,
      session_id,
      term_id,
      school_id,
      date,
      present,
    });

    sendResponse(res, 200, {
      message: "Daily attendance recorded",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// fetch daily attendance
export const fetchTodaysAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { class_id, school_id, session_id, term_id } = req.query;

    if (!class_id || !school_id || !session_id || !term_id) {
      throw new AppError("Missing required query parameters", 400);
    }

    const attendance = await getTodaysAttendanceForClass(
      class_id as string,
      school_id as string,
      session_id as string,
      term_id as string
    );

    sendResponse(res, 200, { attendance });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getStudentAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, student_id } = req.params;
    const { term_id, session_id } = req.query;

    const data = await getAttendance(
      school_id,
      student_id,
      term_id as string,
      session_id as string
    );

    res.status(200).json({ message: "Attendance fetched", data });
  } catch (err) {
    next(err);
  }
};

export const recordClassAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, class_id } = req.params;
    const session_id = (req.query.session_id ||
      (req as any).session_id) as string;
    const term_id = (req.query.term_id || (req as any).term_id) as string;
    const { attendances } = req.body;

    if (!school_id || !class_id || !session_id || !term_id) {
      throw new AppError(
        "school_id, session_id, term_id, and class_id are required",
        400
      );
    }

    const result = await recordBulkAttendance({
      school_id,
      class_id,
      session_id,
      term_id,
      attendances,
    });

    sendResponse(res, 200, {
      message: "Attendance recorded",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const fetchClassAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, class_id } = req.params;
    const { session_id, term_id } = req.query;

    // Ideally calculate total school days from session/term config
    const total_school_days = await calculateTotalSchoolDaysFromTerm(
      term_id as string
    ); // <-- implement this logic based on term start/end

    const result = await getClassAttendance(
      school_id,
      class_id,
      session_id as string,
      term_id as string,
      total_school_days
    );

    sendResponse(res, 200, { message: "Attendance fetched", data: result });
  } catch (err) {
    next(err);
  }
};

export const handleVerifyClassTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, teacher_id } = req.params;

    const session_id = (req.query.session_id ||
      (req as any).session_id) as string;
    const term_id = (req.query.term_id || (req as any).term_id) as string;

    if (!school_id || !teacher_id || !session_id || !term_id) {
      throw new AppError(
        "school_id, session_id, term_id, and teacher_id are required",
        400
      );
    }

    const data = await getTeacherClassStudentsAttendanceReport(
      school_id,
      session_id,
      term_id,
      teacher_id
    );

    sendResponse(res, 200, {
      message: "Attendance report fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceSummaryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { school_id, class_id } = req.params;
    const session_id = (req.query.session_id as string) || req.session_id;
    const term_id = (req.query.term_id as string) || req.term_id;

    if (!school_id || !class_id || !session_id || !term_id) {
      throw new AppError(
        "school_id, class_id, session_id, and term_id are required",
        400
      );
    }

    const summary = await getAttendanceSummary(
      school_id,
      class_id,
      session_id as string,
      term_id as string
    );

    sendResponse(res, 200, summary);
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};
