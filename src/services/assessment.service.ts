import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Assessment from "../models/assessment.model";
import Subject from "../models/subject.model";
import Class from "../models/class.model";
import Term from "../models/term.model";
import Session from "../models/session.model";
import Score from "../models/score.model";
import ClassStudent from "../models/class_student.model";
import GradeScale from "../models/grade_scale.model";

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
  max_score: number,
  session_id?: string
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

  // Validate subject and teacher assignment
  const subject = await Subject.findOne({
    where: { subject_id, teacher_id, is_approved: true },
  });
  if (!subject)
    throw new AppError(
      "Approved subject not found or not assigned to teacher",
      404
    );

  // Validate class
  const classInstance = await Class.findByPk(class_id);
  if (!classInstance) throw new AppError("Class not found", 404);
  if (classInstance.school_id !== subject.school_id)
    throw new AppError("Class does not belong to this school", 403);

  // Validate term and session
  const term = await Term.findByPk(term_id, { include: [{ model: Session }] });
  if (!term) throw new AppError("Term not found", 404);
  if (term.school_id !== subject.school_id)
    throw new AppError("Term does not belong to this school", 403);
  if (date < term.start_date || date > term.end_date) {
    throw new AppError("Assessment date must be within term dates", 400);
  }

  const session = term.session;
  if (session_id) {
    if (session_id !== term.session_id)
      throw new AppError("Term does not belong to the provided session", 400);
  } else {
    // Ensure the term's session is active
    const currentDate = new Date();
    if (session.start_date > currentDate || session.end_date < currentDate) {
      throw new AppError("Term belongs to an inactive session", 400);
    }
  }

  const assessment = await Assessment.create({
    subject_id,
    class_id,
    term_id,
    name,
    type,
    date,
    max_score,
    created_at: new Date(),
    updated_at: new Date(),
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
  school_id: string,
  session_id?: string
) => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(term_id)) throw new AppError("Invalid term ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (session_id && !validateUUID(session_id))
    throw new AppError("Invalid session ID", 400);

  // Validate term and session
  const term = await Term.findOne({
    where: { term_id, school_id },
    include: [{ model: Session }],
  });
  if (!term) throw new AppError("Term not found in this school", 404);
  if (session_id && term.session_id !== session_id) {
    throw new AppError("Term does not belong to the provided session", 400);
  }

  const assessments = await Assessment.findAll({
    where: { class_id, subject_id, term_id },
    include: [{ model: Subject, where: { school_id, is_approved: true } }],
  });

  return assessments;
};

/**
 * Get assessments and scores for a student
 */
export const getStudentAssessments = async (
  user_id: string,
  term_id: string,
  session_id?: string,
  class_id?: string,
  subject_id?: string
) => {
  if (!validateUUID(user_id)) throw new AppError("Invalid user ID", 400);
  if (!validateUUID(term_id)) throw new AppError("Invalid term ID", 400);
  if (session_id && !validateUUID(session_id))
    throw new AppError("Invalid session ID", 400);
  if (class_id && !validateUUID(class_id))
    throw new AppError("Invalid class ID", 400);
  if (subject_id && !validateUUID(subject_id))
    throw new AppError("Invalid subject ID", 400);

  // Fetch student's class history
  const classStudentRecords = await ClassStudent.findAll({
    where: { student_id: user_id },
    include: [{ model: Class, include: [{ model: School }] }],
  });
  if (!classStudentRecords.length)
    throw new AppError("Student not assigned to any class", 400);

  const term = await Term.findByPk(term_id, { include: [{ model: Session }] });
  if (!term) throw new AppError("Term not found", 404);

  // Determine effective session_id and class_id
  let effectiveSessionId = session_id || term.session_id;
  let effectiveClassId = class_id;

  // If no class_id provided, use the latest class
  if (!effectiveClassId) {
    const latestClass = classStudentRecords.sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    )[0];
    effectiveClassId = latestClass.class_id;
  }

  // Verify the student was in the specified or inferred class
  const classStudent = classStudentRecords.find(
    (cs) => cs.class_id === effectiveClassId
  );
  if (!classStudent)
    throw new AppError("Student not associated with this class", 403);

  // Verify school_id match
  if (term.school_id !== classStudent.class.school_id) {
    throw new AppError("Term does not belong to this school", 403);
  }

  // Verify session_id match
  if (effectiveSessionId !== term.session_id) {
    throw new AppError("Term does not belong to the provided session", 400);
  }

  const where: any = {
    class_id: effectiveClassId,
    term_id,
    school_id: classStudent.class.school_id,
  };
  if (subject_id) {
    where.subject_id = subject_id;
  }

  const assessments = await Assessment.findAll({
    where,
    include: [
      {
        model: Score,
        where: { student_id: user_id },
        required: false,
        as: "scores",
      },
      { model: Subject, attributes: ["name"] },
      { model: Class, attributes: ["name", "grade_level"] },
      { model: Term, attributes: ["name", "start_date", "end_date"] },
    ],
  });

  // Fetch grade scales for the school
  const gradeScales = await GradeScale.findAll({
    where: { school_id: classStudent.class.school_id },
  });

  return assessments.map((assessment) => {
    const score = assessment.scores[0]?.score || null;
    let letter_grade: string | null = null;
    if (score !== null) {
      const gradeScale = gradeScales.find(
        (gs) => score >= gs.min_score && score <= gs.max_score
      );
      letter_grade = gradeScale ? gradeScale.letter_grade : null;
    }

    return {
      assessment_id: assessment.assessment_id,
      subject_id: assessment.subject_id,
      subject_name: assessment.subject?.name,
      class_id: assessment.class_id,
      class_name: assessment.class?.name,
      class_grade_level: assessment.class?.grade_level,
      term_id: assessment.term_id,
      term_name: assessment.term?.name,
      session_id: term.session_id,
      name: assessment.name,
      type: assessment.type,
      date: assessment.date,
      max_score: assessment.max_score,
      score,
      letter_grade,
      created_at: assessment.created_at,
      updated_at: assessment.updated_at,
    };
  });
};
