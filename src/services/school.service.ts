import bcrypt from "bcrypt";
import School from "../models/school.model";
import User from "../models/user.model";
import sequelize from "../config/db";
import {
  SchoolRegistrationData,
  SchoolInstance,
  UserInstance,
} from "../types/models.types";
import { AppError } from "../utils/error.util";

export const createSchool = async (
  schoolData: SchoolRegistrationData
): Promise<{ school: SchoolInstance; admin: UserInstance }> => {
  const {
    name,
    address,
    admin_username,
    admin_password,
    admin_email,
    admin_first_name,
    admin_last_name,
  } = schoolData;

  // Check for duplicate school name or admin username/email
  const existingSchool = await School.findOne({ where: { name } });
  if (existingSchool)
    throw new AppError("School with this name already exists", 400);

  const existingUser = await User.findOne({
    where: { username: admin_username },
  });
  if (existingUser) throw new AppError("Admin username already exists", 400);

  const existingEmail = await User.findOne({ where: { email: admin_email } });
  if (existingEmail) throw new AppError("Admin email already exists", 400);

  // Create school and admin in a transaction
  return await sequelize.transaction(async (t) => {
    const school = (await School.create(
      { name, address },
      { transaction: t }
    )) as SchoolInstance;

    const password_hash = await bcrypt.hash(admin_password, 10);
    const admin = (await User.create(
      {
        username: admin_username,
        password_hash,
        email: admin_email,
        role: "Admin",
        school_id: school.school_id!, // Non-null assertion
        first_name: admin_first_name,
        last_name: admin_last_name,
        is_approved: true,
      },
      { transaction: t }
    )) as UserInstance;

    return { school, admin };
  });
};
