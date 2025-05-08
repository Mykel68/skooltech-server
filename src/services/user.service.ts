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

export const getUserById = async (user_id: string): Promise<UserInstance> => {
  const user = await User.findByPk(user_id);
  if (!user) throw new AppError("User not found", 404);
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

export const getTeacherById = async (
  user_id: string
): Promise<UserInstance> => {
  const teacher = await User.findOne({ where: { user_id, role: "Teacher" } });
  if (!teacher) throw new AppError("Teacher not found", 404);
  return teacher as UserInstance;
};

export const getTeachersBySchool = async (
  school_id: string
): Promise<UserInstance[]> => {
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const teachers = await User.findAll({
    where: { school_id, role: "Teacher" },
  });
  return teachers as UserInstance[];
};

export const updateTeacher = async (
  user_id: string,
  updates: Partial<UserAttributes>
): Promise<UserInstance> => {
  const teacher = await User.findOne({ where: { user_id, role: "Teacher" } });
  if (!teacher) throw new AppError("Teacher not found", 404);

  if (updates.username && updates.username !== teacher.username) {
    const existingUser = await User.findOne({
      where: { username: updates.username },
    });
    if (existingUser) throw new AppError("Username already exists", 400);
  }

  if (updates.email && updates.email !== teacher.email) {
    const existingEmail = await User.findOne({
      where: { email: updates.email },
    });
    if (existingEmail) throw new AppError("Email already exists", 400);
  }

  await teacher.update(updates);
  return teacher as UserInstance;
};

export const verifyTeacher = async (
  user_id: string,
  is_approved: boolean
): Promise<UserInstance> => {
  const teacher = await User.findOne({ where: { user_id, role: "Teacher" } });
  if (!teacher) throw new AppError("Teacher not found", 404);

  await teacher.update({ is_approved });
  return teacher as UserInstance;
};

export const deleteTeacher = async (user_id: string): Promise<void> => {
  const teacher = await User.findOne({ where: { user_id, role: "Teacher" } });
  if (!teacher) throw new AppError("Teacher not found", 404);

  await teacher.destroy();
};
