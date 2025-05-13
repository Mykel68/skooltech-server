import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Score from "../models/score.model";
import Assessment from "../models/assessment.model";
import Subject from "../models/subject.model";
import User from "../models/user.model";
import Class from "../models/class.model";
import ClassStudent from "../models/class_student.model";
import GradingConfig from "../models/gradingConfig.model";
import GradeScale from "../models/gradeScale.model";
import Term from "../models/term.model";
import { ScoreInstance } from "../types/models.types";

export async function assignScore(
  assessment_id: string,
  student_id: string,
  score: number,
  teacher_id: string
): Promise<ScoreInstance> {
  if (!validateUUID(assessment_id))
    throw new AppError("Invalid assessment ID", 400);
  if (!validateUUID(student_id)) throw new AppError("Invalid student ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);
  if (score < 0) throw new AppError("Score must be non-negative", 400);

  const assessment = await Assessment.findByPk(assessment_id, {
    include: [
      { model: Subject, where: { teacher_id, is_approved: true } },
      { model: Term },
    ],
  });
  if (!assessment)
    throw new AppError("Assessment not found or not assigned to teacher", 404);
  if (score > assessment.max_score)
    throw new AppError(`Score cannot exceed ${assessment.max_score}`, 400);

  const student = await User.findOne({
    where: { user_id: student_id, role: "Student" },
  });
  if (!student) throw new AppError("Student not found", 404);
  if (student.school_id !== assessment.subject.school_id) {
    throw new AppError("Student does not belong to this school", 403);
  }

  const enrollment = await ClassStudent.findOne({
    where: { class_id: assessment.class_id, student_id },
  });
  if (!enrollment)
    throw new AppError("Student not enrolled in this class", 403);

  const existingScore = await Score.findOne({
    where: { assessment_id, student_id },
  });
  if (existingScore) {
    await existingScore.update({ score });
    return existingScore;
  }

  const newScore = await Score.create({ assessment_id, student_id, score });
  return newScore;
}

export async function getStudentsInClassAndSubject(
  class_id: string,
  subject_id: string,
  term_id: string,
  teacher_id: string
): Promise<any[]> {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(term_id)) throw new AppError("Invalid term ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);

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

  const students = await User.findAll({
    include: [
      {
        model: ClassStudent,
        where: { class_id },
        attributes: [],
      },
    ],
    where: { role: "Student", school_id: subject.school_id },
    attributes: ["user_id", "username", "email", "first_name", "last_name"],
  });

  return students.map((student) => ({
    user_id: student.user_id,
    username: student.username,
    email: student.email,
    first_name: student.first_name,
    last_name: student.last_name,
  }));
}

export async function getStudentScores(
  student_id: string,
  class_id: string,
  term_id: string
): Promise<any[]> {
  if (!validateUUID(student_id)) throw new AppError("Invalid student ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(term_id)) throw new AppError("Invalid term ID", 400);

  const student = await User.findOne({
    where: { user_id: student_id, role: "Student" },
  });
  if (!student) throw new AppError("Student not found", 404);

  const classInstance = await Class.findByPk(class_id);
  if (!classInstance) throw new AppError("Class not found", 404);
  if (classInstance.school_id !== student.school_id)
    throw new AppError("Class does not belong to this school", 403);

  const term = await Term.findByPk(term_id);
  if (!term) throw new AppError("Term not found", 404);
  if (term.school_id !== student.school_id)
    throw new AppError("Term does not belong to this school", 403);

  const enrollment = await ClassStudent.findOne({
    where: { class_id, student_id },
  });
  if (!enrollment)
    throw new AppError("Student not enrolled in this class", 403);

  const scores = await Score.findAll({
    where: { student_id },
    include: [
      {
        model: Assessment,
        where: { class_id, term_id },
        include: [
          { model: Subject, attributes: ["subject_id", "name"] },
          { model: Term, attributes: ["term_id", "name"] },
        ],
      },
    ],
  });

  const gradingConfigs = await GradingConfig.findAll({
    where: { school_id: student.school_id },
  });
  const gradeScales = await GradeScale.findAll({
    where: { school_id: student.school_id },
  });

  return scores.map((score) => {
    const assessment = score.assessment;
    const percentage = (score.score / assessment.max_score) * 100;
    const gradeScale = gradeScales.find(
      (scale) => percentage >= scale.min_score && percentage <= scale.max_score
    );
    const config = gradingConfigs.find(
      (config) => config.assessment_type === assessment.type
    );
    return {
      score_id: score.score_id,
      assessment_id: score.assessment_id,
      assessment_name: assessment.name,
      assessment_type: assessment.type,
      assessment_date: assessment.date,
      term_id: assessment.term.term_id,
      term_name: assessment.term.name,
      subject_id: assessment.subject.subject_id,
      subject_name: assessment.subject.name,
      class_id: assessment.class_id,
      score: score.score,
      max_score: assessment.max_score,
      percentage,
      letter_grade: gradeScale ? gradeScale.letter_grade : null,
      weight: config ? config.weight : null,
    };
  });
}
