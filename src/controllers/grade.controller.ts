import { Request, Response } from 'express';
import * as gradeService from '../services/grade.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
export const getStudentGradesController = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'Student' && req.user?.role !== 'Parent') {
      throw new AppError('Unauthorized', 403);
    }
    const student_id = req.params.student_id || req.user.user_id;
    const grades = await gradeService.getStudentGrades(student_id);
    sendResponse(res, 200, grades);
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};