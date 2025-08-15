import { string } from "joi";
import ClassTeacher from "../models/class_teacher.model";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import ClassStudent from "../models/class_student.model";
import User from "../models/user.model";
import Class from "../models/class.model";
import { UserRole } from "../models/user_role.model";

export const createClassTeacher = async (
  school_id: string,
  session_id: string,
  term_id: string,
  teacher_id: string,
  class_id: string
) => {
  // Validate UUIDs

  if (!validateUUID(school_id))
    throw new AppError("Invalid school ID provided", 400);
  if (!validateUUID(session_id))
    throw new AppError("Invalid session ID provided", 400);
  if (!validateUUID(term_id))
    throw new AppError("Invalid term ID provided", 400);
  if (!validateUUID(teacher_id))
    throw new AppError("Invalid teacher ID provided", 400);
  if (!validateUUID(class_id))
    throw new AppError("Invalid class ID provided", 400);

  // Prevent duplicate
  const exists = await ClassTeacher.findOne({
    where: { class_id, session_id, term_id },
  });
  if (exists)
    throw new AppError(
      "A teacher is already assigned to this class for the selected session and term",
      400
    );

  const assignment = await ClassTeacher.create({
    school_id,
    class_id,
    teacher_id,
    session_id,
    term_id,
  });
  await UserRole.create({
    user_id: teacher_id,
    role_id: 4, // Class Teacher
  });
  return assignment;
};

export const listClassTeachers = async (
  school_id: string,
  session_id: string,
  term_id: string
) => {
  return await ClassTeacher.findAll({
    where: { session_id, school_id, term_id },
    include: [
      {
        association: "teacher",
        attributes: ["user_id", "first_name", "last_name"],
      },
      {
        association: "class",
        attributes: ["class_id", "grade_level", "name"],
      },
      { association: "session", attributes: ["session_id", "name"] },
      { association: "term", attributes: ["term_id", "name"] },
    ],
  });
};

export const getTeacherClassStudents = async (
  school_id: string,
  session_id: string,
  term_id: string,
  teacher_id: string
) => {
  const classDetails = await ClassTeacher.findOne({
    where: {
      school_id,
      teacher_id,
      session_id,
      term_id,
    },
    attributes: ["class_id", "session_id", "term_id"],
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["name", "class_id"],
      },
    ],
  });

  if (!classDetails) {
    throw new AppError(
      "Teacher is not assigned to any class in this session and term",
      404
    );
  }

  // Get students without including class_students
  const assignedStudents = await User.findAll({
    where: {
      school_id,
      role_id: 4, // Student
    },
    include: [
      {
        model: ClassStudent,
        as: "class_students",
        where: {
          class_id: classDetails.class_id,
          session_id: classDetails.session_id,
          term_id: classDetails.term_id,
        },
        attributes: [], // exclude from output
      },
    ],
    attributes: ["user_id", "first_name", "last_name", "email"],
  });

  return {
    classDetails,
    students: assignedStudents,
  };
};

export const deleteClassTeacher = async (class_teacher_id: string) => {
  if (!validateUUID(class_teacher_id))
    throw new AppError("Invalid class teacher ID", 400);
  const record = await ClassTeacher.findByPk(class_teacher_id);
  if (!record) throw new AppError("Class Teacher not found", 404);
  await record.destroy();
};
