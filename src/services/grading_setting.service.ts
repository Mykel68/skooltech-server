import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import GradingSetting, {
  GradingSettingInstance,
} from "../models/grading_setting.model";
import Class from "../models/class.model";
import User from "../models/user.model";
import Subject from "../models/subject.model";

interface GradingComponent {
  name: string;
  weight: number;
}

export const createGradingSetting = async (
  school_id: string,
  class_id: string,
  subject_id: string, // ← added
  teacher_id: string,
  components: GradingComponent[]
): Promise<GradingSettingInstance> => {
  // 1. Validate incoming IDs
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);

  // 2. Verify class exists in this school
  const classRecord = await Class.findOne({
    where: { class_id, school_id },
  });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // 3. Verify subject exists and belongs to this class + teacher + school
  const subjectRecord = await Subject.findOne({
    where: { subject_id, class_id, teacher_id, school_id },
  });
  if (!subjectRecord) {
    throw new AppError("Subject not found for this class/teacher/school", 404);
  }

  // 4. Verify teacher is authorized
  const teacher = await User.findOne({
    where: {
      user_id: teacher_id,
      school_id,
      role_id: 3, // Teacher
      is_approved: true,
    },
  });
  if (!teacher) throw new AppError("Teacher not authorized", 403);

  // 5. Validate components array
  if (!Array.isArray(components) || components.length === 0) {
    throw new AppError("Components must be a non-empty array", 400);
  }
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight !== 100) {
    throw new AppError("Component weights must sum to 100%", 400);
  }
  components.forEach((comp) => {
    if (
      !comp.name ||
      typeof comp.weight !== "number" ||
      comp.weight < 0 ||
      comp.weight > 100
    ) {
      throw new AppError("Invalid component name or weight", 400);
    }
  });

  // 6. Check for existing grading setting on (class, subject, teacher)
  const existing = await GradingSetting.findOne({
    where: { class_id, subject_id, teacher_id },
  });
  if (existing) {
    throw new AppError(
      "Grading setting already exists for this class + subject + teacher",
      409
    );
  }

  // 7. Create new row
  const gradingSetting = await GradingSetting.create({
    class_id,
    subject_id,
    teacher_id,
    school_id,
    components,
  });

  return gradingSetting;
};

export const getGradingSetting = async (
  school_id: string,
  class_id: string,
  subject_id: string,
  teacher_id: string
): Promise<GradingSettingInstance> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);

  // Verify class exists in school
  const classRecord = await Class.findOne({ where: { class_id, school_id } });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // Verify subject exists (class, teacher, school)
  const subjectRecord = await Subject.findOne({
    where: { subject_id, class_id, teacher_id, school_id },
  });
  if (!subjectRecord) {
    throw new AppError("Subject not found for this class/teacher/school", 404);
  }

  // Verify teacher is authorized
  const teacher = await User.findOne({
    where: {
      user_id: teacher_id,
      school_id,
      role_id: 3, // Teacher
      is_approved: true,
    },
  });
  if (!teacher) throw new AppError("Teacher not authorized", 403);

  // Look up grading setting for (class, subject, teacher)
  const setting = await GradingSetting.findOne({
    where: { class_id, subject_id, teacher_id },
  });
  if (!setting) {
    throw new AppError(
      "Grading setting not found for this class/subject/teacher",
      404
    );
  }

  return setting;
};

export const updateGradingSetting = async (
  school_id: string,
  class_id: string,
  subject_id: string,
  teacher_id: string,
  components: GradingComponent[]
): Promise<GradingSettingInstance> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);

  // Verify class exists in school
  const classRecord = await Class.findOne({ where: { class_id, school_id } });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // Verify subject exists (class, teacher, school)
  const subjectRecord = await Subject.findOne({
    where: { subject_id, class_id, teacher_id, school_id },
  });
  if (!subjectRecord) {
    throw new AppError("Subject not found for this class/teacher/school", 404);
  }

  // Verify teacher is authorized
  const teacher = await User.findOne({
    where: {
      user_id: teacher_id,
      school_id,
      role_id: 3, // Teacher
      is_approved: true,
    },
  });
  if (!teacher) throw new AppError("Teacher not authorized", 403);

  // Validate components
  if (!Array.isArray(components) || components.length === 0) {
    throw new AppError("Components must be a non-empty array", 400);
  }
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  if (totalWeight !== 100) {
    throw new AppError("Component weights must sum to 100%", 400);
  }
  components.forEach((comp) => {
    if (
      !comp.name ||
      typeof comp.weight !== "number" ||
      comp.weight < 0 ||
      comp.weight > 100
    ) {
      throw new AppError("Invalid component name or weight", 400);
    }
  });

  // Look up existing setting
  const existingSetting = await GradingSetting.findOne({
    where: { class_id, subject_id, teacher_id },
  });
  if (!existingSetting) {
    throw new AppError(
      "Grading setting not found for this class/subject/teacher",
      404
    );
  }

  // Update only the `components` field
  await existingSetting.update({ components });
  return existingSetting;
};

export const deleteGradingSetting = async (
  school_id: string,
  class_id: string,
  subject_id: string,
  teacher_id: string
): Promise<void> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(subject_id)) throw new AppError("Invalid subject ID", 400);
  if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);

  // Verify class exists in school
  const classRecord = await Class.findOne({ where: { class_id, school_id } });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // Verify subject exists (class, teacher, school)
  const subjectRecord = await Subject.findOne({
    where: { subject_id, class_id, teacher_id, school_id },
  });
  if (!subjectRecord) {
    throw new AppError("Subject not found for this class/teacher/school", 404);
  }

  // Verify teacher is authorized
  const teacher = await User.findOne({
    where: {
      user_id: teacher_id,
      school_id,
      role_id: 3, // Teacher
      is_approved: true,
    },
  });
  if (!teacher) throw new AppError("Teacher not authorized", 403);

  // Look for existing setting
  const existingSetting = await GradingSetting.findOne({
    where: { class_id, subject_id, teacher_id },
  });
  if (!existingSetting) {
    throw new AppError(
      "Grading setting not found for this class/subject/teacher",
      404
    );
  }

  // Destroy it
  await GradingSetting.destroy({ where: { class_id, subject_id, teacher_id } });
};
