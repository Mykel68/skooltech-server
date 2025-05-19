import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import GradingSetting, {
  GradingSettingInstance,
} from "../models/grading_setting.model";
import Class from "../models/class.model";
import User from "../models/user.model";

interface GradingComponent {
  name: string;
  weight: number;
}

export const createGradingSetting = async (
  school_id: string,
  class_id: string,
  teacher_id: string,
  components: GradingComponent[]
): Promise<GradingSettingInstance> => {
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

  // Validate components
  if (!Array.isArray(components) || components.length === 0) {
    throw new AppError("Components must be a non-empty array", 400);
  }
  const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0);
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

  // Check for existing setting
  const existingSetting = await GradingSetting.findOne({
    where: { class_id, teacher_id },
  });
  if (existingSetting) {
    throw new AppError(
      "Grading setting already exists for this class and teacher",
      409
    );
  }

  const gradingSetting = await GradingSetting.create({
    class_id,
    teacher_id,
    school_id,
    components,
  });

  return gradingSetting;
};

export const getGradingSetting = async (
  school_id: string,
  class_id: string,
  teacher_id: string
): Promise<GradingSettingInstance> => {
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

  // Check for existing setting
  const setting = await GradingSetting.findOne({
    where: { class_id, teacher_id },
  });
  if (!setting) {
    throw new AppError(
      "Grading setting not found for this class and teacher",
      404
    );
  }

  return setting;
};

export const updateGradingSetting = async (
  school_id: string,
  class_id: string,
  teacher_id: string,
  components: GradingComponent[]
): Promise<GradingSettingInstance> => {
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

  // Validate components
  if (!Array.isArray(components) || components.length === 0) {
    throw new AppError("Components must be a non-empty array", 400);
  }
  const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0);
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

  // Check for existing setting
  const existingSetting = await GradingSetting.findOne({
    where: { class_id, teacher_id },
  });
  if (existingSetting) {
    throw new AppError("Grading setting already exists", 400);
  }

  const gradingSetting = await GradingSetting.create({
    class_id,
    teacher_id,
    school_id,
    components,
  });

  return gradingSetting;
};

// export const updateGradingSetting = async (
//   school_id: string,
//   class_id: string,
//   teacher_id: string,
//   components: GradingComponent[]
// ): Promise<GradingSettingInstance> => {
//   if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
//   if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
//   if (!validateUUID(teacher_id)) throw new AppError("Invalid teacher ID", 400);

//   // Verify class exists in school
//   const classRecord = await Class.findOne({
//     where: { class_id, school_id },
//   });
//   if (!classRecord) throw new AppError("Class not found in this school", 404);

//   // Verify teacher is authorized
//   const teacher = await User.findOne({
//     where: {
//       user_id: teacher_id,
//       school_id,
//       role: "Teacher",
//       is_approved: true,
//     },
//   });
//   if (!teacher) throw new AppError("Teacher not found or not authorized", 403);

//   // Validate components
//   if (!Array.isArray(components) || components.length === 0) {
//     throw new AppError("Components must be a non-empty array", 400);
//   }
//   const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0);
//   if (totalWeight !== 100) {
//     throw new AppError("Component weights must sum to 100%", 400);
//   }
//   components.forEach((comp) => {
//     if (
//       !comp.name ||
//       typeof comp.weight !== "number" ||
//       comp.weight < 0 ||
//       comp.weight > 100
//     ) {
//       throw new AppError("Invalid component name or weight", 400);
//     }
//   });

//   // Check for existing setting
//   const existingSetting = await GradingSetting.findOne({
//     where: { class_id, teacher_id },
//   });
//   if (!existingSetting) {
//     throw new AppError(
//       "Grading setting not found for this class and teacher",
//       404
//     );
//   }

//   const gradingSetting = await GradingSetting.update(
//     {
//       components,
//     },
//     {
//       where: { class_id, teacher_id },
//     }
//   );

//   return gradingSetting;
// };

export const deleteGradingSetting = async (
  school_id: string,
  class_id: string,
  teacher_id: string
): Promise<void> => {
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

  // Check for existing setting
  const existingSetting = await GradingSetting.findOne({
    where: { class_id, teacher_id },
  });
  if (!existingSetting) {
    throw new AppError(
      "Grading setting not found for this class and teacher",
      404
    );
  }

  await GradingSetting.destroy({
    where: { class_id, teacher_id },
  });
};
