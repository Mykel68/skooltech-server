import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import GradeScale from "../models/gradeScale.model";
import School from "../models/school.model";
import { GradeScaleInstance } from "../types/models.types";

/**
 * Create a new grade scale for a school
 * @returns Promise<GradeScale>
 */
export const createGradeScale = async (
  school_id: string,
  letter_grade: string,
  min_score: number,
  max_score: number
): Promise<GradeScaleInstance> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!letter_grade) throw new AppError("Letter grade is required", 400);
  if (min_score < 0 || max_score < min_score)
    throw new AppError("Invalid score range", 400);

  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const existingScale = await GradeScale.findOne({
    where: { school_id, letter_grade },
  });
  if (existingScale)
    throw new AppError("Letter grade already exists for this school", 400);

  const overlappingScale = await GradeScale.findOne({
    where: {
      school_id,
      [Op.or]: [
        {
          min_score: { [Op.lte]: max_score },
          max_score: { [Op.gte]: min_score },
        },
      ],
    },
  });
  if (overlappingScale)
    throw new AppError("Score range overlaps with existing grade scale", 400);

  const scale = await GradeScale.create({
    school_id,
    letter_grade,
    min_score,
    max_score,
  });
  return scale;
};

/**
 * Update an existing grade scale
 * @returns Promise<GradeScale>
 */
export const updateGradeScale = async (
  scale_id: string,
  letter_grade: string,
  min_score: number,
  max_score: number
): Promise<GradeScaleInstance> => {
  if (!validateUUID(scale_id)) throw new AppError("Invalid scale ID", 400);
  if (!letter_grade) throw new AppError("Letter grade is required", 400);
  if (min_score < 0 || max_score < min_score)
    throw new AppError("Invalid score range", 400);

  const scale = await GradeScale.findByPk(scale_id);
  if (!scale) throw new AppError("Grade scale not found", 404);

  const existingScale = await GradeScale.findOne({
    where: {
      school_id: scale.school_id,
      letter_grade,
      scale_id: { [Op.ne]: scale_id },
    },
  });
  if (existingScale)
    throw new AppError("Letter grade already exists for this school", 400);

  const overlappingScale = await GradeScale.findOne({
    where: {
      school_id: scale.school_id,
      scale_id: { [Op.ne]: scale_id },
      [Op.or]: [
        {
          min_score: { [Op.lte]: max_score },
          max_score: { [Op.gte]: min_score },
        },
      ],
    },
  });
  if (overlappingScale)
    throw new AppError("Score range overlaps with existing grade scale", 400);

  await scale.update({ letter_grade, min_score, max_score });
  return scale;
};
