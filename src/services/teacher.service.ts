import Class from "../models/class.model";
import User from "../models/user.model";
import ClassStudent from "../models/class_student.model";
import ClassTeacher from "../models/class_teacher.model";
import Subject from "../models/subject.model";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";

export const getTeachersByClass = async (
  school_id: string,
  student_id: string,
  class_id: string
): Promise<any[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(student_id)) throw new AppError("Invalid student ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);

  // Verify class belongs to the school
  const classRecord = await Class.findOne({
    where: { class_id, school_id },
  });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // Verify student is in the class
  const classStudent = await ClassStudent.findOne({
    where: { class_id, student_id },
  });
  if (!classStudent)
    throw new AppError("Student not enrolled in this class", 403);

  // Get teachers teaching the class with their subjects
  const classTeachers = await ClassTeacher.findAll({
    where: { class_id, school_id },
    include: [
      {
        model: User,
        as: "teacher",
        where: { role: "Teacher", is_approved: true },
        attributes: ["user_id", "first_name", "last_name"],
      },
      {
        model: Subject,
        as: "subject",
        attributes: ["subject_id", "name"],
      },
    ],
    order: [
      ["teacher", "last_name", "ASC"],
      ["teacher", "first_name", "ASC"],
    ],
  });

  if (!classTeachers.length) {
    return [];
  }

  return classTeachers.map((classTeacher) => ({
    teacher_id: classTeacher.teacher?.user_id,
    first_name: classTeacher.teacher?.first_name,
    last_name: classTeacher.teacher?.last_name,
    subject: {
      subject_id: classTeacher.subject?.subject_id,
      name: classTeacher.subject?.name,
    },
  }));
};
