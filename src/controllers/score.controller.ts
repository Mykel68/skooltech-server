import { Request, Response } from "express";
import * as scoreService from "../services/score.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

/**
 * Assign or update a student’s score for an assessment
 */
export const assignScoreHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { assessment_id } = req.params;
  const { student_id, score } = req.body;
  const teacher_id = (req as any).user?.user_id;

  try {
    if (!assessment_id || !student_id || score === undefined) {
      throw new AppError(
        "Assessment ID, student ID, and score are required",
        400
      );
    }

    const newScore = await scoreService.assignScore(
      assessment_id,
      student_id,
      score,
      teacher_id!
    );

    sendResponse(res, 201, {
      score_id: newScore.score_id,
      assessment_id: newScore.assessment_id,
      student_id: newScore.student_id,
      score: newScore.score,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Fetch all students in a given class & subject for a teacher
 */
export const getStudentsInClassAndSubjectHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { class_id, subject_id } = req.params;
  const teacher_id = (req as any).user?.user_id;

  try {
    if (!class_id || !subject_id) {
      throw new AppError("Class ID and subject ID are required", 400);
    }

    const students = await scoreService.getStudentsInClassAndSubject(
      class_id,
      subject_id,
      teacher_id!
    );

    sendResponse(res, 200, students);
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Fetch all scores for the authenticated student in a given class
 */
export const getStudentScoresHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { class_id } = req.params;
  const student_id = (req as any).user?.user_id;

  try {
    if (!class_id) {
      throw new AppError("Class ID is required", 400);
    }

    const scores = await scoreService.getStudentScores(student_id!, class_id);

    sendResponse(res, 200, scores);
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
