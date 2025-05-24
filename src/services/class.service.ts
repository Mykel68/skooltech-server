import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Class from "../models/class.model";
import School from "../models/school.model";
import { ClassInstance } from "../types/models.types";

/**
 * Create a new class in a school
 * @returns Promise<ClassInstance>
 */
export const createClass = async (
  school_id: string,
  name: string,
  grade_level?: string,
  short?: string
): Promise<ClassInstance> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!name) throw new AppError("Class name is required", 400);

  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const classInstance = await Class.create({
    school_id,
    name,
    grade_level,
    short,
  });
  return classInstance;
};

/**
 * Get a class by ID and school ID
 * @returns Promise<ClassInstance>
 */
export const getClassById = async (
  class_id: string,
  school_id: string
): Promise<ClassInstance> => {
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const classInstance = await Class.findOne({
    where: { class_id, school_id },
  });

  if (!classInstance) throw new AppError("Class not found", 404);

  return classInstance;
};

export const getAllClassesOfSchool = async (
  school_id: string
): Promise<ClassInstance[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const classes = await Class.findAll({
    where: { school_id },
    include: [School],
    order: [["name", "ASC"]],
  });

  return classes;
};

export const getStudentClass = async (
  school_id: string,
  student_id: string
): Promise<ClassInstance> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(student_id)) throw new AppError("Invalid student ID", 400);

  const classInstance = await Class.findOne({
    where: { school_id },
    include: [
      {
        model: School,
        as: "school",
      },
    ],
  });

  if (!classInstance) throw new AppError("Class not found", 404);

  return classInstance;
};
