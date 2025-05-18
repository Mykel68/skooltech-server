import { AppError } from "../utils/error.util";
import { sendResponse } from "../utils/response.util";
import { Request, Response } from "express";
import * as studentService from "../services/student.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getStudentByClass = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized: No user data", 401);
    }

    const { class_id } = req.params;
    const school_id = req.user.school_id;

    const student = await studentService.getStudentByClass(class_id, school_id);

    sendResponse(res, 200, student);
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
// export const getStudentInClass = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { class_id } = req.params;
//   const { student_id } = req.params;
//   const school_id = (req as any).user?.school_id;

//   try {
//     if (!class_id || !student_id) {
//       throw new AppError("Class ID and student ID are required", 400);
//     }

//     const student = await studentService.getStudentInClass(
//       class_id,
//       student_id
//     );

//     sendResponse(res, 200, student);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode || 500, {
//       message: error.message || "Internal server error",
//     });
//   }
// };

// export const getStudentScores = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { student_id } = req.params;
//   const { class_id, term_id } = req.params;
//   const school_id = (req as any).user?.school_id;

//   try {
//     if (!student_id || !class_id || !term_id) {
//       throw new AppError("Student ID, class ID and term ID are required", 400);
//     }

//     const student = await studentService.getStudentInClass(
//       class_id,
//       student_id
//     );

//     const scores = await studentService.getStudentScores(
//       student_id,
//       class_id,
//       term_id
//     );

//     sendResponse(res, 200, scores);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode || 500, {
//       message: error.message || "Internal server error",
//     });
//   }
// };

// export const getStudentsInClassAndSubject = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { class_id } = req.params;
//   const { subject_id, term_id } = req.params;
//   const school_id = (req as any).user?.school_id;

//   try {
//     if (!class_id || !subject_id || !term_id) {
//       throw new AppError("Class ID, subject ID and term ID are required", 400);
//     }

//     const student = await studentService.getStudentInClass(
//       class_id,
//       student_id
//     );

//     sendResponse(res, 200, students);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode || 500, {
//       message: error.message || "Internal server error",
//     });
//   }
// };
