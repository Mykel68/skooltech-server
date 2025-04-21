import bcrypt from "bcrypt";
import User from "../models/user.model";
import School from "../models/school.model";
import {
  UserRegistrationData,
  UserInstance,
  UserAttributes,
} from "../types/models.types";
import { AppError } from "../utils/error.util";

export const registerUser = async (
  userData: UserRegistrationData
): Promise<UserInstance> => {
  const { username, password, email, role, first_name, last_name, school_id } =
    userData;

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) throw new AppError("Username already exists", 400);

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) throw new AppError("Email already exists", 400);

  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password_hash,
    email,
    role,
    school_id,
    first_name,
    last_name,
    is_approved: role === "Student" ? true : false,
  });

  return user as UserInstance;
};

export const updateUser = async (
  user_id: string,
  updates: Partial<UserAttributes>
): Promise<UserInstance> => {
  const user = await User.findByPk(user_id);
  if (!user) throw new AppError("User not found", 404);

  if (updates.username && updates.username !== user.username) {
    const existingUser = await User.findOne({
      where: { username: updates.username },
    });
    if (existingUser) throw new AppError("Username already exists", 400);
  }

  if (updates.email && updates.email !== user.email) {
    const existingEmail = await User.findOne({
      where: { email: updates.email },
    });
    if (existingEmail) throw new AppError("Email already exists", 400);
  }

  await user.update(updates);
  return user as UserInstance;
};
