import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DataTypes, Op } from "sequelize";
import User, { UserInstance } from "../models/user.model";
import School from "../models/school.model";
import Session from "../models/session.model";
import { AppError } from "../utils/error.util";

import ClassStudent from "../models/class_student.model";
import { validateUUID } from "../utils/validation.util";
import Class from "../models/class.model";
import { v4 as uuidv4 } from "uuid";
import PasswordToken from "../models/passwordResetToken";
import { sendResetEmail } from "../utils/email.service.util";
import { addMinutes } from "../utils/date.util";
import Term from "../models/term.model";
import {
  StudentTeacherRegistrationData,
  UserRegistrationData,
} from "../types/models.types";
import { Role, sequelize } from "../models";
import { generateAdmissionNumber } from "../utils/admission_number.util";
import { UserRole } from "../models/user_role.model";

export const login = async (
  username: string,
  password: string
): Promise<string> => {
  // Find user by username
  const user: UserInstance | null = await User.findOne({ where: { username } });
  if (!user) throw new AppError("User not found", 404);

  // Get role details from role_id
  const role = await Role.findByPk(user.role_id);
  if (!role) throw new AppError("User role not found", 400);

  // Restrict to Admin login
  if (role.name !== "Admin" && role.name !== "Super Admin")
    throw new AppError("Only admins can log in here", 403);

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  const school = await School.findByPk(user.school_id!);
  if (!school) throw new AppError("School not found", 404);

  // Find active session for the school
  const currentDate = new Date();
  const session = await Session.findOne({
    where: {
      school_id: user.school_id!,
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });

  const token = jwt.sign(
    {
      user_id: user.user_id,
      school_id: user.school_id,
      session_id: session?.session_id,
      school_code: school.school_code,
      role_id: user.role_id,
      role_name: role.name,
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
  const {
    username,
    email,
    password,
    role_id,
    first_name,
    last_name,
    school_id,
    gender,
  } = userData;

  // Check if school exists
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("Invalid school ID", 404);

  // Verify role exists
  const role = await Role.findByPk(role_id);
  if (!role) throw new AppError("Invalid role ID", 404);

  // Check if username or email already exists
  const [existingUser, existingEmail] = await Promise.all([
    User.findOne({ where: { username } }),
    User.findOne({ where: { email } }),
  ]);
  if (existingUser) throw new AppError("Username already taken", 400);
  if (existingEmail) throw new AppError("Email already registered", 400);

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    username,
    email,
    password_hash,
    role_id,
    first_name,
    last_name,
    school_id,
    is_approved: role.name === "Teacher" ? false : true,
    gender,
  });

  return newUser;
};

export const loginTeacherStudent = async (
  username: string,
  password: string,
  school_code: string
): Promise<string> => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError("User not found", 404);

  const school = await School.findByPk(user.school_id!);
  if (!school) throw new AppError("School not found", 404);

  if (school.school_code !== school_code) {
    throw new AppError("Invalid school code", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  // Fetch roles from UserRole
  const userWithRoles = await User.findOne({
    where: { username },
    include: [{ model: Role, through: { attributes: [] } }],
  });

  if (!userWithRoles) throw new AppError("User not found", 404);

  const roleNames = userWithRoles.roles?.map((r) => r.Role?.name) || [];

  // Find active session
  const currentDate = new Date();
  const session = await Session.findOne({
    where: {
      school_id: user.school_id!,
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });

  if (!session)
    throw new AppError("No active session found for this school", 400);

  // Optional: get class_id for students
  let class_id: string | undefined;
  if (roleNames.includes("Student")) {
    const classStudent = await ClassStudent.findOne({
      where: { student_id: user.user_id },
    });
    if (classStudent) class_id = classStudent.class_id;
  }

  // Generate JWT
  const token = jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      school_id: user.school_id,
      school_name: school.name,
      school_code: school.school_code,
      school_image: school.school_image,
      roles: roleNames, // 🔁 Array of roles
      session_id: session.session_id,
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
    role_id,
    first_name,
    last_name,
    school_id,
    class_id,
    session_id,
    term_id,
    gender,
  } = userData;

  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  // Fetch role
  const role = await Role.findByPk(role_id);
  if (!role) throw new AppError("Invalid role ID", 400);

  if (!["Student", "Teacher", "Parent"].includes(role.name)) {
    throw new AppError(
      "Only Student, Parent or Teacher roles are allowed",
      400
    );
  }

  if (role.name === "Student") {
    if (!class_id) throw new AppError("Class ID is required for students", 400);
    if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
  } else if (role.name === "Teacher" && class_id) {
    throw new AppError("Class ID is not allowed for teachers", 400);
  }

  // School validation
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  if (!school.school_code && role.name === "Student") {
    throw new AppError(
      "School code not defined. Cannot create admission number",
      500
    );
  }

  // Check username/email uniqueness
  const [existingUser, existingEmail] = await Promise.all([
    User.findOne({ where: { username } }),
    User.findOne({ where: { email } }),
  ]);
  if (existingUser) throw new AppError("Username already taken", 400);
  if (existingEmail) throw new AppError("Email already registered", 400);

  // Validate class belongs to school
  if (role.name === "Student" && class_id) {
    const classInstance = await Class.findByPk(class_id);
    if (!classInstance) throw new AppError("Class not found", 404);
    if (classInstance.school_id !== school_id) {
      throw new AppError("Class does not belong to this school", 403);
    }
  }

  const password_hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
  const user_id = uuidv4();

  return await sequelize.transaction(async (t) => {
    let admission_number: string | undefined = undefined;

    if (role.name === "Student") {
      admission_number = await generateAdmissionNumber(school_id, t);
    }

    // ✅ Create user WITHOUT role_id
    const newUser = await User.create(
      {
        user_id,
        username,
        email,
        password_hash,
        first_name,
        last_name,
        school_id,
        is_approved: ["Teacher", "Parent"].includes(role.name) ? false : true,
        is_active: true,
        gender,
        admission_number,
      },
      { transaction: t }
    );

    // ✅ Add role to UserRole mapping table
    await UserRole.create(
      {
        user_id: newUser.user_id,
        role_id: role.role_id,
      },
      { transaction: t }
    );

    // ✅ Student-specific logic
    if (role.name === "Student" && class_id && session_id && term_id) {
      await ClassStudent.create(
        {
          class_id,
          student_id: user_id,
          session_id,
          term_id,
          created_at: new Date(),
        },
        { transaction: t }
      );
    }

    return newUser;
  });
};

// export const verifyUsername = async (username: string): Promise<string> => {
// 	if (!username) throw new AppError('No username', 404);
// };

export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  // remove any existing tokens
  await PasswordToken.destroy({ where: { user_id: user.user_id } });

  // create new token
  const token = uuidv4();
  const expires_at = addMinutes(new Date(), 15);

  await PasswordToken.create({ user_id: user.user_id!, token, expires_at });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?email=${user.email}&token=${token}`;

  await sendResetEmail(user.email, resetUrl);
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const record = await PasswordToken.findOne({ where: { token } });
  if (!record || record.expires_at < new Date()) {
    throw new Error("Token is invalid or expired");
  }

  const user = await User.findByPk(record.user_id);
  if (!user) throw new Error("User not found");

  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password_hash: hashed });

  // clean up token
  await record.destroy();
};

export const checkUsernameAvailabilityService = async (
  username: string,
  school_id: string
) => {
  if (!validateUUID(school_id)) {
    throw new AppError("Invalid school ID", 400);
  }

  const user = await User.findOne({
    where: { username, school_id },
  });

  return !user; // true if available
};

export const checkEmailAvailabilityService = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  return !user; // true if available
};
