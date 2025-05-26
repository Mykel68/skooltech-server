import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import StudentScore, {
  StudentScoreInstance,
} from "../models/student_score.model";
import GradingSetting from "../models/grading_setting.model";
import Class from "../models/class.model";
import User from "../models/user.model";
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
  console.log("Grading Setting Query:", {
    class_id,
    teacher_id,
    school_id,
    gradingSetting: gradingSetting ? gradingSetting.toJSON() : null,
  });
  if (!gradingSetting)
    throw new AppError(
      "Grading setting not found for this class and teacher",
      404
    );
  if (!gradingSetting.grading_setting_id) {
    console.error("Grading Setting ID is undefined:", gradingSetting.toJSON());
    throw new AppError("Invalid grading setting ID", 500);
  }

  // Validate component names
  const validComponents = gradingSetting.components.map((comp) => comp.name);
  const results: StudentScoreInstance[] = [];

  for (const input of scoreInputs) {
    if (!validateUUID(input.user_id))
      throw new AppError(`Invalid user ID: ${input.user_id}`, 400);

    // Verify student is in class
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
        `Scores already assigned for student ${input.user_id}. Use PATCH to update.`,
        409
      );
    }

    // Create score
    try {
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
    } catch (error: any) {
      console.error("Student Score Creation Error:", error.message, {
        input,
        grading_setting_id: gradingSetting.grading_setting_id,
      });
      throw new AppError(
        `Failed to create student score: ${error.message}`,
        400
      );
    }
  }

  return results;
};

export const editStudentScores = async (
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
  console.log("Grading Setting Query for Edit:", {
    class_id,
    teacher_id,
    school_id,
    gradingSetting: gradingSetting ? gradingSetting.toJSON() : null,
  });
  if (!gradingSetting)
    throw new AppError(
      "Grading setting not found for this class and teacher",
      404
    );
  if (!gradingSetting.grading_setting_id) {
    console.error("Grading Setting ID is undefined:", gradingSetting.toJSON());
    throw new AppError("Invalid grading setting ID", 500);
  }

  // Validate component names
  const validComponents = gradingSetting.components.map((comp) => comp.name);
  const results: StudentScoreInstance[] = [];

  for (const input of scoreInputs) {
    if (!validateUUID(input.user_id))
      throw new AppError(`Invalid user ID: ${input.user_id}`, 400);

    // Verify student is in class
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

    // Find existing score
    const existingScore = await StudentScore.findOne({
      where: {
        grading_setting_id: gradingSetting.grading_setting_id,
        user_id: input.user_id,
        class_id,
      },
    });

    if (!existingScore) {
      throw new AppError(
        `No scores found for student ${input.user_id} in this class. Use POST to create.`,
        404
      );
    }

    try {
      // Update existing score
      const studentScore = await existingScore.update({
        scores: input.scores,
        total_score,
      });
      console.log("Score Updated:", {
        user_id: input.user_id,
        scores: input.scores,
        total_score,
      });
      results.push(studentScore);
    } catch (error: any) {
      console.error("Student Score Update Error:", error.message, {
        input,
        grading_setting_id: gradingSetting.grading_setting_id,
      });
      throw new AppError(
        `Failed to update student score: ${error.message}`,
        400
      );
    }
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
  // console.log("gradingSetting", gradingSetting?.components);
  if (!gradingSetting)
    throw new AppError(
      "Grading setting not found for this class and teacher",
      404
    );

  // Fetch scores with student details
  const scores = (await StudentScore.findAll({
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
    attributes: [
      "score_id",
      "scores",
      "total_score",
      "created_at",
      "updated_at",
    ],
  })) as StudentScoreInstance[];

  // Fetch class details
  const classes = await Class.findAll({
    where: { class_id },
    attributes: ["class_id", "name", "grade_level"],
  });

  // Format response
  return scores.map((score) => ({
    class: classes,
    score_id: score.score_id,
    grading: gradingSetting?.components,
    student: {
      user_id: score.student?.user_id ?? "",
      first_name: score.student?.first_name ?? "",
      last_name: score.student?.last_name ?? "",
    },
    scores: score.scores,
    total_score: score.total_score,
  }));
};

export const editBulkStudentScores = async (
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
  if (!gradingSetting.grading_setting_id) {
    throw new AppError("Invalid grading setting ID", 500);
  }

  // Validate component names
  const validComponents = gradingSetting.components.map((comp) => comp.name);

  // Collect user_ids to bulk verify their enrollment
  const userIds = scoreInputs.map((input) => input.user_id);

  // Bulk verify all students are in the class
  const enrolledStudents = await ClassStudent.findAll({
    where: { class_id, student_id: { [Op.in]: userIds } },
  });

  const enrolledStudentIds = enrolledStudents.map((cs) => cs.student_id);
  const missingStudents = userIds.filter(
    (id) => !enrolledStudentIds.includes(id)
  );
  if (missingStudents.length > 0) {
    throw new AppError(
      `Students not found in this class: ${missingStudents.join(", ")}`,
      404
    );
  }

  const results: StudentScoreInstance[] = [];

  // Use a transaction to ensure all-or-nothing updates
  const updatedScores = await StudentScore.sequelize?.transaction(async (t) => {
    for (const input of scoreInputs) {
      if (!validateUUID(input.user_id)) {
        throw new AppError(`Invalid user ID: ${input.user_id}`, 400);
      }

      // Validate scores length and components
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

      // Find existing score record
      const existingScore = await StudentScore.findOne({
        where: {
          grading_setting_id: gradingSetting.grading_setting_id,
          user_id: input.user_id,
          class_id,
        },
        transaction: t,
        lock: t.LOCK.UPDATE, // Lock for update inside transaction
      });

      if (!existingScore) {
        throw new AppError(
          `No scores found for student ${input.user_id} in this class. Use POST to create.`,
          404
        );
      }

      // Update score record
      const updatedScore = await existingScore.update(
        {
          scores: input.scores,
          total_score,
        },
        { transaction: t }
      );

      results.push(updatedScore);
    }

    return results;
  });

  return updatedScores ?? results;
};

export const getStudentOwnScores = async (
  school_id: string,
  class_id: string,
  student_id: string
): Promise<any> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(student_id)) throw new AppError("Invalid student ID", 400);

  const classRecord = await Class.findOne({
    where: { class_id, school_id },
  });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // const classStudent = await ClassStudent.findOne({
  //   where: { class_id, student_id },
  // });
  // if (!classStudent)
  //   throw new AppError("Student not enrolled in this class", 403);

  const score = (await StudentScore.findOne({
    where: {
      class_id,
      school_id,
      user_id: student_id,
    },
    include: [
      {
        model: User,
        as: "teacher",
        attributes: ["user_id", "first_name", "last_name"],
      },
      {
        model: GradingSetting,
        as: "grading_setting",
        attributes: ["grading_setting_id", "components"],
      },
    ],
    attributes: [
      "score_id",
      "scores",
      "total_score",
      "created_at",
      "updated_at",
    ],
  })) as StudentScoreInstance;

  if (!score) {
    return {
      class: {
        class_id: classRecord.class_id,
        name: classRecord.name,
        grade_level: classRecord.grade_level,
      },
      scores: [],
      total_score: null,
      created_at: null,
      updated_at: null,
    };
  }

  return {
    class: {
      class_id: classRecord.class_id,
      name: classRecord.name,
      grade_level: classRecord.grade_level,
    },
    score_id: score.score_id,
    // teacher: {
    //   user_id: score.teacher?.user_id ?? "",
    //   first_name: score.teacher?.first_name ?? "",
    //   last_name: score.teacher?.last_name ?? "",
    // },
    scores: score.scores,
    total_score: score.total_score,
  };
};

export const getStudentSubjectsAndScores = async (
  school_id: string,
  student_id: string
): Promise<any[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(student_id)) throw new AppError("Invalid student ID", 400);

  const student = await User.findOne({
    where: {
      user_id: student_id,
      school_id,
      role: "Student",
      is_approved: true,
    },
  });
  if (!student) throw new AppError("Student not found or not authorized", 404);

  const classStudents = await ClassStudent.findAll({
    where: { student_id, school_id },
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["class_id", "name", "grade_level"],
      },
    ],
  });

  if (!classStudents.length) {
    return [];
  }

  const classIds = classStudents.map((cs) => cs.class_id);

  const scores = (await StudentScore.findAll({
    where: {
      school_id,
      user_id: student_id,
      class_id: { [Op.in]: classIds },
    },
    include: [
      {
        model: User,
        as: "teacher",
        attributes: ["user_id", "first_name", "last_name"],
      },
      {
        model: Class,
        as: "class",
        attributes: ["class_id", "name", "grade_level"],
      },
      {
        model: GradingSetting,
        as: "grading_setting",
        attributes: ["grading_setting_id", "components"],
        include: [
          {
            model: ClassTeacher,
            as: "class_teacher",
            attributes: ["subject_id"],
            include: [
              {
                model: Subject,
                as: "subject",
                attributes: ["subject_id", "name"],
              },
            ],
          },
        ],
      },
    ],
    attributes: [
      "score_id",
      "class_id",
      "scores",
      "total_score",
      "created_at",
      "updated_at",
    ],
  })) as StudentScoreInstance[];

  return scores.map((score) => {
    const subject = score.grading_setting?.class_teacher?.subject;
    return {
      class: {
        class_id: score.class?.class_id ?? "",
        name: score.class?.name ?? "",
        grade_level: score.class?.grade_level ?? "",
      },
      score_id: score.score_id,
      teacher: {
        user_id: score.teacher?.user_id ?? "",
        first_name: score.teacher?.first_name ?? "",
        last_name: score.teacher?.last_name ?? "",
      },
      subject: {
        subject_id: subject?.subject_id ?? "",
        name: subject?.name ?? "Unknown",
      },
      scores: score.scores,
      total_score: score.total_score,
      grade: getGrade(score.total_score),
      created_at: score.created_at,
      updated_at: score.updated_at,
    };
  });
};
