import { Request, Response } from "express";
import * as subjectService from "../services/subject.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

/**
 * Handle subject creation request
 */
export const createSubjectHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { class_id } = req.params;
  const { name, short } = req.body;
  const teacher_id = (req as any).user?.user_id;

  try {
    if (!class_id || !name) {
      throw new AppError("Class ID and name are required", 400);
    }

    const subject = await subjectService.createSubject(
      class_id,
      teacher_id!,
      name,
      short
    );

    sendResponse(res, 201, {
      subject_id: subject.subject_id,
      school_id: subject.school_id,
      class_id: subject.class_id,
      teacher_id: subject.teacher_id,
      name: subject.name,
      is_approved: subject.is_approved,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Handle subject approval request
 */
export const approveSubjectHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subject_id } = req.params;

  try {
    if (!subject_id) {
      throw new AppError("Subject ID is required", 400);
    }

    const subject = await subjectService.approveSubject(subject_id);

    sendResponse(res, 200, {
      subject_id: subject.subject_id,
      school_id: subject.school_id,
      class_id: subject.class_id,
      teacher_id: subject.teacher_id,
      name: subject.name,
      is_approved: subject.is_approved,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Handle fetching approved subjects by class
 */
export const getSubjectsByClassHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { class_id } = req.params;
  const school_id = (req as any).user?.school_id;

  try {
    if (!class_id) {
      throw new AppError("Class ID is required", 400);
    }

    const subjects = await subjectService.getSubjectsByClass(
      class_id,
      school_id!
    );

    sendResponse(
      res,
      200,
      subjects.map((subject) => ({
        subject_id: subject.subject_id,
        school_id: subject.school_id,
        class_id: subject.class_id,
        teacher_id: subject.teacher_id,
        name: subject.name,
        is_approved: subject.is_approved,
      }))
    );
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const getSubjectByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subject_id } = req.params;
  const school_id = (req as any).user?.school_id;

  try {
    if (!subject_id) {
      throw new AppError("Subject ID is required", 400);
    }

    const subject = await subjectService.getSubjectById(subject_id, school_id!);

    sendResponse(res, 200, subject);
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const getSubjectsOfaSchool = async (
  req: Request,
  res: Response
): Promise<void> => {
  const school_id = (req as any).user?.school_id;
  const subjects = await subjectService.getSubjectsOfSchool(school_id!);

  try {
    sendResponse(
      res,
      200,
      subjects.map((subject: any) => ({
        subject_id: subject.subject_id,
        school_id: subject.school_id,
        // class_id: subject.class_id,
        class_name: subject.class?.name, // <-- class name
        grade_level: subject.class?.grade_level,
        // teacher_id: subject.teacher_id,
        teacher_name: subject.teacher?.username, // <-- teacher name
        teacher_email: subject.teacher?.email,
        name: subject.name,
        is_approved: subject.is_approved,
      }))
    );
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const getSubjectsOfaClass = async (
  req: Request,
  res: Response
): Promise<void> => {
  const class_id = (req as any).user?.class_id;
  const subjects = await subjectService.getSubjectsOfClass(class_id!);

  // sendResponse(
  //   res,
  //   200,
  //   subjects.map((subject) => ({
  //     subject_id: subject.subject_id,
  //     school_id: subject.school_id,
  //     class_id: subject.class_id,
  //     teacher_id: subject.teacher_id,
  //     name: subject.name,
  //     is_approved: subject.is_approved,
  //   }))
  // );
  try {
    sendResponse(
      res,
      200,
      subjects.map((subject) => ({
        subject_id: subject.subject_id,
        school_id: subject.school_id,
        class_id: subject.class_id,
        teacher_id: subject.teacher_id,
        name: subject.name,
        is_approved: subject.is_approved,
      }))
    );
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const getSubjectsOfaTeacher = async (
  req: Request,
  res: Response
): Promise<void> => {
  const teacher_id = (req as any).user?.user_id;
  const school_id = (req as any).user?.school_id;
  const subjects = await subjectService.getSubjectsOfTeacherFromSchool(
    teacher_id!,
    school_id!
  );

  try {
    sendResponse(
      res,
      200,
      subjects.map((subject: any) => ({
        subject_id: subject.subject_id,
        // school_id: subject.school_id,
        class_id: subject.class_id,
        class_name: subject.class?.name, // <-- class name
        grade_level: subject.class?.grade_level,
        // teacher_id: subject.teacher_id,
        // teacher_name: subject.teacher?.username, // <-- teacher name
        // teacher_email: subject.teacher?.email,
        name: subject.name,
        is_approved: subject.is_approved,
      }))
    );
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const deleteSubjectHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subject_id } = req.params;
  const school_id = (req as any).user?.school_id;

  try {
    if (!subject_id) {
      throw new AppError("Subject ID is required", 400);
    }

    const subject = await subjectService.deleteSubject(subject_id);

    sendResponse(res, 200, {
      message: "subject deleted",
      subject,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
  return;
};
