import { Request, Response, NextFunction } from 'express';
import { generateParentLinkCode, linkParentToStudentByCode } from '../services/parentLinkCode.service';
import sendResponse from '../utils/sendResponse';
import AppError from '../utils/appError';

export const studentGenerateLinkCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student_user_id = req.user?.user_id;
    if (!student_user_id) throw new AppError('
