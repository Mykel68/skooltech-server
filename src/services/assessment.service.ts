import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Assessment from "../models/assessment.model";
import Subject from "../models/subject.model";
import Class from "../models/class.model";
import Term from "../models/term.model";

/**
 * Create a new assessment
 */
export const createAssessment = async (
  subject_id: string,
  class_id: string,
  term_id: string,
  teacher_id: string,
  name: string,
  type: "Exam" | "Quiz" | "Assignment",
  date: Date,
  max_score: number
) => {
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(term_id)) throw new AppError("Invalid term ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);
  if (!name) throw new AppError("Assessment name is required", 400);
  if (!["Exam", "Quiz", "Assignment"].includes(type))
    throw new AppError("Invalid assessment type", 400);
  if (!date || isNaN(date.getTime())) throw new AppError("Invalid date", 400);
  if (max_score <= 0) throw new AppError("Max score must be positive", 400);

  const subject = await Subject.findOne({
    where: { subject_id, teacher_id, is_approved: true },
  });
  if (!subject)
    throw new AppError(
      "Approved subject not found or not assigned to teacher",
      404
    );

  const classInstance = await Class.findByPk(class_id);
  if (!classInstance) throw new AppError("Class not found", 404);
  if (classInstance.school_id !== subject.school_id)
    throw new AppError("Class does not belong to this school", 403);

  const term = await Term.findByPk(term_id);
  if (!term) throw new AppError("Term not found", 404);
  if (term.school_id !== subject.school_id)
    throw new AppError("Term does not belong to this school", 403);
  if (date < term.start_date || date > term.end_date) {
    throw new AppError("Assessment date must be within term dates", 400);
  }

  const assessment = await Assessment.create({
    subject_id,
    class_id,
    term_id,
    name,
    type,
    date,
    max_score,
  });

  return assessment;
};

/**
 * Get all assessments by class, subject, term, and school
 */
export const getAssessmentsByClassAndSubject = async (
  class_id: string,
  subject_id: string,
  term_id: string,
  school_id: string
) => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(term_id)) throw new AppError("Invalid term ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const term = await Term.findOne({ where: { term_id, school_id } });
  if (!term) throw new AppError("Term not found in this school", 404);

  const assessments = await Assessment.findAll({
    where: { class_id, subject_id, term_id },
    include: [{ model: Subject, where: { school_id, is_approved: true } }],
  });

  return assessments;
};
