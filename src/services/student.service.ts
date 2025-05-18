import Assessment from "../models/assessment.model";
import Class from "../models/class.model";
import ClassStudent from "../models/class_student.model";
import GradeScale from "../models/gradeScale.model";
import GradingConfig from "../models/gradingConfig.model";
import Score from "../models/score.model";
import Subject from "../models/subject.model";
import { Term } from "../models/term.model";
import User from "../models/user.model";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";

// export const getStudentInClass = async (
//   class_id: string,
//   student_id: string
// ): Promise<any> => {
//   if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
//   if (!validateUUID(student_id)) throw new AppError("Invalid student ID", 400);

//   const student = await User.findOne({
//     where: { user_id: student_id, role: "Student" },
//   });
//   if (!student) throw new AppError("Student not found", 404);
//   if (student.school_id !== class_id.school_id)
//     throw new AppError("Student does not belong to this school", 403);

//   const enrollment = await ClassStudent.findOne({
//     where: { class_id, student_id },
//   });
//   if (!enrollment)
//     throw new AppError("Student not enrolled in this class", 403);

//   return student;
// };

export const getStudentByClass = async (
  class_id: string,
  school_id: string
): Promise<any> => {
  if (!class_id) throw new AppError("Invalid class ID", 400);
  if (!school_id) throw new AppError("Invalid student ID", 400);

  const classRecord = await Class.findOne({
    where: { class_id, school_id: school_id },
  });
  if (!classRecord) throw new AppError("Class not found", 404);

  const student = await Class.findOne({
    where: { class_id, school_id },
    attributes: ["first_name", "last_name"],
    order: [["last_name", "ASC"]],
  });
  if (!student) throw new AppError("Student not found", 404);
  if (student.school_id !== classRecord.school_id)
    throw new AppError("Student does not belong to this school", 403);
};

export const getStudentById = async (user_id: string): Promise<any> => {
  if (!user_id) throw new AppError("Invalid user ID", 400);

  const student = await User.findOne({
    where: { user_id, role: "Student" },
  });
  if (!student) throw new AppError("Student not found", 404);
  return student;
};

// export const getStudentScores = async (
//   student_id: string,
//   class_id: string,
//   term_id: string
// ): Promise<any[]> => {
//   if (!student_id) throw new AppError("Invalid student ID", 400);
//   if (!class_id) throw new AppError("Invalid class ID", 400);
//   if (!term_id) throw new AppError("Invalid term ID", 400);

//   const student = await User.findOne({
//     where: { user_id: student_id, role: "Student" },
//   });
//   if (!student) throw new AppError("Student not found", 404);
//   if (student.school_id !== class_id.school_id)
//     throw new AppError("Student does not belong to this school", 403);

//   const enrollment = await ClassStudent.findOne({
//     where: { class_id, student_id },
//   });
//   if (!enrollment)
//     throw new AppError("Student not enrolled in this class", 403);

//   const scores = await Score.findAll({
//     where: { student_id },
//     include: [
//       {
//         model: Assessment,
//         where: { class_id, term_id },
//         include: [
//           { model: Subject, attributes: ["subject_id", "name"] },
//           { model: Term, attributes: ["term_id", "name"] },
//         ],
//       },
//     ],
//   });

//   const gradingConfigs = await GradingConfig.findAll({
//     where: { school_id: student.school_id },
//   });
//   const gradeScales = await GradeScale.findAll({
//     where: { school_id: student.school_id },
//   });

//   return scores.map((score) => {
//     const assessment = score.assessment;
//     const percentage = (score.score / assessment.max_score) * 100;
//     const gradeScale = gradeScales.find(
//       (scale) => percentage >= scale.min_score && percentage <= scale.max_score
//     );
//     const config = gradingConfigs.find(
//       (config) => config.assessment_type === assessment.type
//     );
//     return {
//       score_id: score.score_id,
//       assessment_id: score.assessment_id,
//       assessment_name: assessment.name,
//       assessment_type: assessment.type,
//       assessment_date: assessment.date,
//       term_id: assessment.term.term_id,
//       term_name: assessment.term.name,
//       subject_id: assessment.subject.subject_id,
//       subject_name: assessment.subject.name,
//       class_id: assessment.class_id,
//       score: score.score,
//       max_score: assessment.max_score,
//       percentage,
//       letter_grade: gradeScale ? gradeScale.letter_grade : null,
//       weight: config ? config.weight : null,
//     };
//   });
// };
