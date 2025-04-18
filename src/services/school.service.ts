import School from "../models/school.model";
import { SchoolAttributes, SchoolInstance } from "../types/models.types";
import { AppError } from "../utils/error.util";

export const createSchool = async (
  schoolData: SchoolAttributes
): Promise<SchoolInstance> => {
  const { name, address } = schoolData;

  // Check for duplicate school name
  const existingSchool = await School.findOne({ where: { name } });
  if (existingSchool)
    throw new AppError("School with this name already exists", 400);

  const school = (await School.create({
    name,
    address,
  })) as SchoolInstance;

  return school;
};
