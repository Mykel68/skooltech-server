import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import StudentScore, {
  StudentScoreInstance,
} from "../models/student_score.model";
import GradingSetting from "../models/grading_setting.model";
import Class from "../models/class.model";
import User from "../models/user.model";
import Student from "../models/student.model";
import ClassStudent from "../models/class_student.model";

interface ScoreInput {
  user_id: string;
  scores: { component_name: string; score: number }[];
}

export const assignStudentScores = async (
  school_id: string,
  class_id: string,
  teacher_id: string,
  scoreInputs: ScoreInput[]
): Promise<StudentScoreInstance[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);

  // Verify class exists in school
  const classRecord = await Class.findOne({
    where: { class_id, school_id },
  });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // Verify teacher is authorized
  const teacher = await User.findOne({
    where: {
      user_id: teacher_id,
      school_id,
      role: "Teacher",
      is_approved: true,
    },
  });
  if (!teacher) throw new AppError("Teacher not found or not authorized", 403);

  // Get grading setting
  const gradingSetting = await GradingSetting.findOne({
    where: { class_id, teacher_id, school_id },
  });
  if (!gradingSetting)
    throw new AppError(
      "Grading setting not found for this class and teacher",
      404
    );

  // Validate component names
  const validComponents = gradingSetting.components.map((comp) => comp.name);
  const results: StudentScoreInstance[] = [];

  for (const input of scoreInputs) {
    if (!validateUUID(input.user_id))
      throw new AppError(`Invalid user ID: ${input.user_id}`, 400);

    // Verify student
    // const student = await User.findOne({
    //   where: {
    //     user_id: input.user_id,
    //     school_id,
    //     role: "Student",
    //     is_approved: true,
    //   },
    //   include: [{ model: Student, as: "student", where: { class_id } }],
    // });
    // if (!student || !student.student)
    //   throw new AppError(
    //     `Student not found in this class: ${input.user_id}`,
    //     404
    //   );

    // verfify student is in class
    const classStudent = await ClassStudent.findOne({
      where: { class_id, student_id: input.user_id },
    });
    if (!classStudent)
      throw new AppError(
        `Student not found in this class: ${input.user_id}`,
        404
      );

    // Validate scores
    if (
      !Array.isArray(input.scores) ||
      input.scores.length !== validComponents.length
    ) {
      throw new AppError(
        `Scores must match grading components: ${validComponents.join(", ")}`,
        400
      );
    }

    const scoreMap = new Map(
      input.scores.map((s) => [s.component_name, s.score])
    );
    const missingComponents = validComponents.filter(
      (comp) => !scoreMap.has(comp)
    );
    if (missingComponents.length > 0) {
      throw new AppError(
        `Missing scores for components: ${missingComponents.join(", ")}`,
        400
      );
    }

    const invalidScores = input.scores.filter(
      (s) =>
        !validComponents.includes(s.component_name) ||
        typeof s.score !== "number" ||
        isNaN(s.score) ||
        s.score < 0 ||
        s.score > 100
    );
    if (invalidScores.length > 0) {
      throw new AppError(
        `Invalid scores: ${JSON.stringify(invalidScores)}`,
        400
      );
    }

    // Calculate total score
    let total_score = 0;
    for (const comp of gradingSetting.components) {
      const score = scoreMap.get(comp.name) || 0;
      total_score += (score * comp.weight) / 100;
    }

    // Check for existing score
    const existingScore = await StudentScore.findOne({
      where: {
        grading_setting_id: gradingSetting.grading_setting_id,
        user_id: input.user_id,
        class_id,
      },
    });
    if (existingScore) {
      throw new AppError(
        `Scores already assigned for student ${input.user_id} in this class`,
        409
      );
    }

    // Create score
    const studentScore = await StudentScore.create({
      grading_setting_id: gradingSetting.grading_setting_id as string,
      user_id: input.user_id,
      class_id,
      teacher_id,
      school_id,
      scores: input.scores,
      total_score,
    });

    results.push(studentScore);
  }

  return results;
};

export const getStudentScores = async (
  school_id: string,
  class_id: string,
  teacher_id: string
): Promise<any[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);

  // Verify class exists in school
  const classRecord = await Class.findOne({
    where: { class_id, school_id },
  });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // Verify teacher is authorized
  const teacher = await User.findOne({
    where: {
      user_id: teacher_id,
      school_id,
      role: "Teacher",
      is_approved: true,
    },
  });
  if (!teacher) throw new AppError("Teacher not found or not authorized", 403);

  // Get grading setting
  const gradingSetting = await GradingSetting.findOne({
    where: { class_id, teacher_id, school_id },
  });
  if (!gradingSetting)
    throw new AppError(
      "Grading setting not found for this class and teacher",
      404
    );

  // Fetch scores with student details
  const scores = await StudentScore.findAll({
    where: {
      class_id,
      school_id,
      teacher_id,
      grading_setting_id: gradingSetting.grading_setting_id,
    },
    include: [
      {
        model: User,
        as: "student",
        where: { role: "Student", is_approved: true },
        attributes: ["user_id", "first_name", "last_name"],
      },
    ],
    attributes: ["score_id", "scores", "total_score"],
  });

  // also return the class of the student
  const classes = await Class.findAll({
    where: { class_id },
    attributes: ["class_id", "name", "grade_level"],
  });

  // Format response
  return scores.map((score) => ({
    class: classes,
    score_id: score.score_id,
    student: {
      user_id: score.student?.user_id,
      first_name: score.student?.first_name,
      last_name: score.student?.last_name,
    },
    scores: score.scores,
    total_score: score.total_score,
  }));
};
