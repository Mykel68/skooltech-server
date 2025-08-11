import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Subject, { SubjectInstance } from "../models/subject.model";
import Class from "../models/class.model";
import User from "../models/user.model";
import { ClassStudent } from "../models";

/**
 * Create a new subject under a class by a teacher
 */
export const createSubject = async (
  class_id: string,
  teacher_id: string,
  name: string,
  short: string,
  session_id: string,
  term_id: string
): Promise<SubjectInstance> => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);
  if (!name) throw new AppError("Subject name is required", 400);

  const classInstance = await Class.findByPk(class_id);
  if (!classInstance) throw new AppError("Class not found", 404);

  const teacher = await User.findOne({
    where: {
      user_id: teacher_id,
      role_id: 3, // Teacher
      is_approved: true,
    },
  });
  if (!teacher) throw new AppError("Approved teacher not found", 404);

  const subject = await Subject.create({
    school_id: classInstance.school_id,
    class_id,
    teacher_id,
    name,
    short,
    session_id,
    term_id,
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
 * Disapprove a subject
 */
export const disapproveSubject = async (
  subject_id: string
): Promise<SubjectInstance> => {
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);

  const subject = await Subject.findByPk(subject_id);
  if (!subject) throw new AppError("Subject not found", 404);
  if (!subject.is_approved)
    throw new AppError("Subject already dispproved", 400);

  await subject.update({ is_approved: false });
  return subject;
};

/**
 * update a subject
 */
export const updateSubject = async (
  school_id: string,
  subject_id: string,
  updates: Partial<SubjectInstance>
): Promise<SubjectInstance> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);

  const subject = await Subject.findOne({ where: { subject_id, school_id } });
  if (!subject) throw new AppError("Subject not found", 404);

  // ✅ If class_id is being updated, validate it
  if (updates.class_id) {
    if (!validateUUID(updates.class_id)) {
      throw new AppError("Invalid class ID", 400);
    }

    const classExists = await Class.findOne({
      where: {
        class_id: updates.class_id,
        school_id,
      },
    });

    if (!classExists) {
      throw new AppError("Class does not exist in this school", 404);
    }
  }

  await subject.update(updates);

  return subject;
};

/**
 * Fetch all approved subjects for a given class and school
 */
export const getSubjectsByClass = async (
  school_id: string,
  session_id: string,
  term_id: string,
  class_id: string
): Promise<SubjectInstance[]> => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subjects = await Subject.findAll({
    where: { class_id, school_id, is_approved: true, session_id, term_id },
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
  school_id: string,
  session_id: string,
  term_id: string
): Promise<any[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subjects = await Subject.findAll({
    where: { school_id, session_id, term_id },
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["class_id", "name", "grade_level"],
      },
      {
        model: User,
        as: "teacher",
        attributes: ["user_id", "first_name", "last_name", "email"],
      },
    ],
  });

  const results = await Promise.all(
    subjects.map(async (subject) => {
      const student_count = await ClassStudent.count({
        where: {
          class_id: subject.class_id,
          session_id,
          term_id,
        },
      });

      return {
        subject_id: subject.subject_id,
        name: subject.name,
        short: subject.short,
        is_approved: subject.is_approved,
        class: subject.class
          ? {
              class_id: subject.class.class_id,
              name: subject.class.name,
              grade_level: subject.class.grade_level,
            }
          : null,
        teacher: subject.teacher
          ? {
              teacher_id: subject.teacher.user_id,
              name: `${subject.teacher.first_name} ${subject.teacher.last_name}`,
              email: subject.teacher.email,
            }
          : null,
        student_count,
        created_at: subject.created_at,
      };
    })
  );

  return results;
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
 * Fetch all subjects of a class by student
 */
export const getSubjectsOfClassByStudent = async (
  school_id: string,
  session_id: string,
  term_id: string,
  class_id: string
): Promise<SubjectInstance[]> => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subjects = await Subject.findAll({
    where: {
      class_id,
      school_id,
      is_approved: true,
      session_id,
      term_id,
    },
    include: [
      {
        model: User,
        as: "teacher",
        attributes: ["user_id", "last_name", "first_name", "email"],
      },
    ],
  });

  return subjects;
};
/**
 * Get subjects of a teacher from a school
 */
export const getSubjectsOfTeacherFromSchool = async (
  school_id: string,
  session_id: string,
  term_id: string,
  teacher_id: string
): Promise<{ subjects: SubjectInstance[] }> => {
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subjects = await Subject.findAll({
    where: { teacher_id, school_id, session_id, term_id },
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

  return { subjects };
};

export const deleteSubject = async (
  school_id: string,
  subject_id: string
): Promise<void> => {
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const subject = await Subject.findOne({
    where: { subject_id, school_id },
  });

  if (!subject) throw new AppError("Subject not found for this school", 404);

  await subject.destroy();
};
