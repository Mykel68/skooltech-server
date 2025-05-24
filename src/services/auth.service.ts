import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DataTypes, Op } from "sequelize";
import User from "../models/user.model";
import School from "../models/school.model";
import Session from "../models/session.model";
import { AppError } from "../utils/error.util";
import {
  StudentTeacherRegistrationData,
  UserInstance,
  UserRegistrationData,
} from "../types/models.types";
import ClassStudent from "../models/class_student.model";
import { validateUUID } from "../utils/validation.util";
import Class from "../models/class.model";
import { v4 as uuidv4 } from "uuid";
import ClassTeacher from "../models/class_teacher.model";

export const login = async (
  username: string,
  password: string
): Promise<string> => {
  const user: UserInstance | null = await User.findOne({ where: { username } });
  if (!user) throw new AppError("User not found", 404);

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  // Although this is not the login endpoint for teachers and students, we need to check if the user is a teacher and if the account is approved
  if (user.role === "Teacher" && !user.is_approved) {
    throw new AppError("Account awaiting approval", 403);
  }

  const school = await School.findByPk(user.school_id);
  if (!school) throw new AppError("School not found", 404);

  // Find active session for the school
  const currentDate = new Date();
  const session = await Session.findOne({
    where: {
      school_id: user.school_id,
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });
  // if (!session)
  //   throw new AppError("No active session found for this school", 400);

  const token = jwt.sign(
    {
      user_id: user.user_id,
      school_id: user.school_id,
      session_id: session?.session_id, // Added session_id
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
    is_approved: role === "Teacher" ? false : true,
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

  // Find active session for the school
  const currentDate = new Date();
  const session = await Session.findOne({
    where: {
      school_id: user.school_id,
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });
  if (!session)
    throw new AppError("No active session found for this school", 400);

  let class_id: string | undefined;
  if (user.role === "Student") {
    const classStudent = await ClassStudent.findOne({
      where: { student_id: user.user_id },
    });
    if (classStudent) class_id = classStudent.class_id;
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      school_id: user.school_id,
      session_id: session.session_id, // Added session_id
      school_code: school.school_code,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      school_name: school.name,
      school_image: school.school_image,
      is_approved: user.is_approved,
      class_id,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  );

  return token;
};

// Register user function
export const registerTeacherStudent = async (
  userData: StudentTeacherRegistrationData
): Promise<UserInstance> => {
  const {
    username,
    email,
    password,
    role,
    first_name,
    last_name,
    school_id,
    class_id,
  } = userData;

  // Validate inputs
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (role === "Student" && !class_id)
    throw new AppError("Class ID is required for students", 400);
  if (role !== "Student" && class_id)
    throw new AppError("Class ID is only allowed for students", 400);
  if (class_id && !validateUUID(class_id))
    throw new AppError("Invalid class ID", 400);

  // Verify school exists
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  // Verify username and email uniqueness
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) throw new AppError("Username already taken", 400);

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) throw new AppError("Email already registered", 400);

  // Validate class_id for students
  if (role === "Student" && class_id) {
    const classInstance = await Class.findByPk(class_id);
    if (!classInstance) throw new AppError("Class not found", 404);
    if (classInstance.school_id !== school_id) {
      throw new AppError("Class does not belong to this school", 403);
    }
  }

  // Validate role
  if (!["Admin", "Teacher", "Student", "Parent"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const user_id = uuidv4();

  // Create user
  const newUser = await User.create({
    user_id,
    username,
    email,
    password_hash,
    role,
    first_name,
    last_name,
    school_id,
    is_approved: role === "Teacher" ? false : true,
    is_active: true,
  });

  // Assign student to class via ClassStudent
  if (role === "Student" && class_id) {
    await ClassStudent.create({
      class_id,
      student_id: user_id,
      created_at: new Date(),
    });
  }

  return newUser;
};
