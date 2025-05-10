import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Assessment from "../models/assessment.model";
import Class from "../models/class.model";
import Subject from "../models/subject.model";
import { AssessmentInstance } from "../types/models.types";

/**
 * Create a new assessment
 * @returns Promise<AssessmentInstance>
 */
export const createAssessment = async (
  subject_id: string,
  class_id: string,
  teacher_id: string,
  name: string,
  type: string,
  date: Date,
  max_score: number
): Promise<AssessmentInstance> => {
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);

  // Ensure the class and subject exist
  const classInstance = await Class.findByPk(class_id);
  if (!classInstance) throw new AppError("Class not found", 404);

  const subjectInstance = await Subject.findByPk(subject_id);
  if (!subjectInstance) throw new AppError("Subject not found", 404);

  const assessment = await Assessment.create({
    subject_id,
    class_id,
    teacher_id,
    name,
    type,
    date,
    max_score,
  });

  return assessment;
};

/**
 * Get all assessments by class ID and subject ID
 * @returns Promise<AssessmentInstance[]>
 */
export const getAssessmentsByClassAndSubject = async (
  class_id: string,
  subject_id: string,
  school_id: string
): Promise<AssessmentInstance[]> => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);

  // Ensure the class exists within the school
  const classInstance = await Class.findOne({ where: { class_id, school_id } });
  if (!classInstance) throw new AppError("Class not found in this school", 404);

  const assessments = await Assessment.findAll({
    where: { class_id, subject_id },
  });

  if (assessments.length === 0) throw new AppError("No assessments found", 404);

  return assessments;
};
