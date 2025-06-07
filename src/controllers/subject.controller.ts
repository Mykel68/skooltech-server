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
  console.log("body", req.body);
  const { name, short, session_id, term_id } = req.body;
  const teacher_id = (req as any).user?.user_id;

  try {
    if (!class_id || !name) {
      throw new AppError("Class ID and name are required", 400);
    }

    const subject = await subjectService.createSubject(
      class_id,
      teacher_id!,
      name,
      short,
      session_id,
      term_id
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

export const getSubjectByaStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { class_id } = req.params;
  const school_id = (req as any).user?.school_id;

  try {
    const subjects = await subjectService.getSubjectsOfClassByStudent(
      school_id!,
      class_id
    );

    sendResponse(
      res,
      200,
      subjects.map((subject) => ({
        subject_id: subject.subject_id,
        class_id: subject.class_id,
        name: subject.name,
        short: subject.short,
        teacher: subject.teacher
          ? {
              user_id: subject.teacher.user_id,
              username: subject.teacher.username,
              email: subject.teacher.email,
            }
          : null,
      }))
    );
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

export const updateSubjectHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subject_id, school_id } = req.params;
  const updates = req.body;

  try {
    if (!subject_id) {
      throw new AppError("Subject ID is required", 400);
    }
    if (!school_id) {
      throw new AppError("School ID is required", 400);
    }

    const subject = await subjectService.updateSubject(
      school_id,
      subject_id,
      updates
    );

    sendResponse(res, 200, {
      message: "Subject updated successfully",
      subject,
    });
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
  const { subject_id, school_id: paramSchoolId } = req.params;
  const userSchoolId = (req as any).user?.school_id;

  try {
    if (!subject_id) {
      throw new AppError("Subject ID is required", 400);
    }
    if (!paramSchoolId) {
      throw new AppError("School ID is required in the route", 400);
    }
    if (!userSchoolId) {
      throw new AppError("School ID missing from authenticated user", 401);
    }
    if (paramSchoolId !== userSchoolId) {
      throw new AppError("You are not authorized to access this school", 403);
    }

    await subjectService.deleteSubject(userSchoolId, subject_id);

    sendResponse(res, 200, {
      message: "Subject deleted successfully",
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
