import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Subject from "../models/subject.model";
import Class from "../models/class.model";
import User from "../models/user.model";
import { SubjectInstance } from "../types/models.types";

/**
 * Create a new subject under a class by a teacher
 */
export const createSubject = async (
  class_id: string,
  teacher_id: string,
  name: string,
  short: string
): Promise<SubjectInstance> => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);
  if (!name) throw new AppError("Subject name is required", 400);

  const classInstance = await Class.findByPk(class_id);
  if (!classInstance) throw new AppError("Class not found", 404);

  const teacher = await User.findOne({
    where: { user_id: teacher_id, role: "Teacher", is_approved: true },
  });
  if (!teacher) throw new AppError("Approved teacher not found", 404);

  const subject = await Subject.create({
    school_id: classInstance.school_id,
    class_id,
    teacher_id,
    name,
    short,
  });

  return subject;
};

/**
 * Approve a pending subject
 */
export const approveSubject = async (
  subject_id: string
): Promise<SubjectInstance> => {
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);

  const subject = await Subject.findByPk(subject_id);
  if (!subject) throw new AppError("Subject not found", 404);
  if (subject.is_approved) throw new AppError("Subject already approved", 400);

  await subject.update({ is_approved: true });
  return subject;
};

/**
 * Fetch all approved subjects for a given class and school
 */
export const getSubjectsByClass = async (
  class_id: string,
  school_id: string
): Promise<SubjectInstance[]> => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subjects = await Subject.findAll({
    where: { class_id, school_id, is_approved: true },
  });

  return subjects;
};

/**
 *
 */

export const getSubjectById = async (
  subject_id: string,
  school_id: string
): Promise<SubjectInstance> => {
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subject = await Subject.findOne({
    where: { subject_id, school_id },
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["name", "grade_level"],
      },
      {
        model: User,
        as: "teacher",
        attributes: ["username", "email"],
      },
    ],
  });

  if (!subject) throw new AppError("Subject not found", 404);

  return subject;
};

/**
 * Fetch all subjects of a school
 */
export const getSubjectsOfSchool = async (
  school_id: string
): Promise<SubjectInstance[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subjects = await Subject.findAll({
    where: { school_id },
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["name", "grade_level"],
      },
      {
        model: User,
        as: "teacher",
        attributes: ["username", "email"],
      },
    ],
  });

  return subjects;
};

/**
 * Fetch all subjects of a class
 */
export const getSubjectsOfClass = async (
  class_id: string
): Promise<SubjectInstance[]> => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);

  const subjects = await Subject.findAll({
    where: { class_id },
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["name", "grade_level"],
      },
      {
        model: User,
        as: "teacher",
        attributes: ["username", "email"],
      },
    ],
  });

  return subjects;
};

/**
 * Get subjects of a teacher from a school
 */
export const getSubjectsOfTeacherFromSchool = async (
  teacher_id: string,
  school_id: string
): Promise<SubjectInstance[]> => {
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subjects = await Subject.findAll({
    where: { teacher_id, school_id },
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["name", "grade_level"],
      },
      {
        model: User,
        as: "teacher",
        attributes: ["username", "email"],
      },
    ],
  });

  return subjects;
};

export const deleteSubject = async (subject_id: string) => {
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);

  const subject = await Subject.findByPk(subject_id);
  if (!subject) throw new AppError("Subject not found", 404);

  await subject.destroy();
};
