import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import School from "../models/school.model";
import { AppError } from "../utils/error.util";
import { UserInstance, UserRegistrationData } from "../types/models.types";

export const login = async (
  username: string,
  password: string
): Promise<string> => {
  const user: UserInstance | null = await User.findOne({ where: { username } });
  if (!user) throw new AppError("User not found", 404);

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  if (user.role === "Teacher" && !user.is_approved) {
    throw new AppError("Account awaiting approval", 403);
  }

  const school = await School.findByPk(user.school_id);
  if (!school) throw new AppError("School not found", 404);

  const token = jwt.sign(
    {
      user_id: user.user_id,
      school_id: user.school_id,
      school_code: school.school_code,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      school_name: school.name,
      school_image: school.school_image,
      is_school_active: school.is_active,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  );

  return token;
};

// export const registerUser = async (
//   userData: UserRegistrationData
// ): Promise<UserInstance> => {
//   const { username, email, password, role, first_name, last_name, school_id } =
//     userData;

//   // Check if username or email already exists
//   const existingUser = await User.findOne({
//     where: {
//       username: username,
//     },
//   });
//   if (existingUser) {
//     throw new AppError("Username already taken", 400);
//   }

//   const existingEmail = await User.findOne({
//     where: {
//       email: email,
//     },
//   });
//   if (existingEmail) {
//     throw new AppError("Email already registered", 400);
//   }

//   // Hash the password
//   const salt = await bcrypt.genSalt(10);
//   const password_hash = await bcrypt.hash(password, salt);

//   // Create user
//   const newUser = await User.create({
//     username,
//     email,
//     password_hash,
//     role,
//     first_name,
//     last_name,
//     school_id,
//   });

//   return newUser;
// };

export const registerUser = async (
  userData: UserRegistrationData
): Promise<UserInstance> => {
  const { username, email, password, role, first_name, last_name, school_id } =
    userData;

  // Check if school exists
  const school = await School.findByPk(school_id);
  if (!school) {
    throw new AppError("Invalid school ID", 404);
  }

  // Check if username or email already exists
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new AppError("Username already taken", 400);
  }

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    throw new AppError("Email already registered", 400);
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    username,
    email,
    password_hash,
    role,
    first_name,
    last_name,
    school_id,
    is_approved: role === "Teacher" ? false : true, // 👈 automatically set is_approved false for teachers
  });

  return newUser;
};

export const loginTeacherStudent = async (
  username: string,
  password: string,
  school_code: string
): Promise<string> => {
  const user: UserInstance | null = await User.findOne({ where: { username } });
  if (!user) throw new AppError("User not found", 404);

  const school = await School.findByPk(user.school_id);
  if (!school) throw new AppError("School not found", 404);

  if (school.school_code !== school_code) {
    throw new AppError("Invalid school code", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  if (user.role === "Teacher" && !user.is_approved) {
    throw new AppError("Account awaiting approval", 403);
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      school_id: user.school_id,
      school_code: school.school_code,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      school_name: school.name,
      school_image: school.school_image,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return token;
};
