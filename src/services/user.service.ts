import bcrypt from "bcrypt";
import User, { UserAttributes, UserInstance } from "../models/user.model";
import School from "../models/school.model";
import { UserRegistrationData } from "../types/models.types";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Class from "../models/class.model";
import ClassStudent from "../models/class_student.model";

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
  if (!validateUUID(user_id)) throw new AppError("Invalid user ID", 400);

  const user = await User.findByPk(user_id);
  if (!user) throw new AppError("User not found", 404);
  return user as UserInstance;
};

export const updateUser = async (
  user_id: string,
  updates: Partial<UserAttributes>
): Promise<UserInstance> => {
  if (!validateUUID(user_id)) throw new AppError("Invalid user ID", 400);

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
  if (!validateUUID(user_id)) throw new AppError("Invalid teacher ID", 400);

  const teacher = await User.findOne({ where: { user_id, role: "Teacher" } });
  if (!teacher) throw new AppError("Teacher not found", 404);
  return teacher as UserInstance;
};

export const getTeachersBySchool = async (
  school_id: string
): Promise<UserInstance[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const teachers = await User.findAll({
    where: { school_id, role: "Teacher" },
    attributes: [
      "user_id",
      "username",
      "email",
      "first_name",
      "last_name",
      "role",
      "school_id",
      "is_approved",
    ],
  });
  return teachers as UserInstance[];
};

export const updateTeacher = async (
  user_id: string,
  updates: Partial<UserAttributes>
): Promise<UserInstance> => {
  if (!validateUUID(user_id)) throw new AppError("Invalid teacher ID", 400);

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
  if (!validateUUID(user_id)) throw new AppError("Invalid teacher ID", 400);

  const teacher = await User.findOne({ where: { user_id, role: "Teacher" } });
  if (!teacher) throw new AppError("Teacher not found", 404);

  await teacher.update({ is_approved });
  return teacher as UserInstance;
};

export const deleteTeacher = async (user_id: string): Promise<void> => {
  if (!validateUUID(user_id)) throw new AppError("Invalid teacher ID", 400);

  const teacher = await User.findOne({ where: { user_id, role: "Teacher" } });
  if (!teacher) throw new AppError("Teacher not found", 404);

  await teacher.destroy();
};

export const verifyStudent = async (
  user_id: string,
  is_approved: boolean
): Promise<UserInstance> => {
  if (!validateUUID(user_id)) throw new AppError("Invalid student ID", 400);

  const student = await User.findOne({ where: { user_id, role: "Student" } });
  if (!student) throw new AppError("Student not found", 404);

  await student.update({ is_approved });
  return student as UserInstance;
};

export const verifyUsers = async (
  user_ids: string[],
  is_approved: boolean
): Promise<UserInstance[]> => {
  //   if (!validateUUID(user_ids)) throw new AppError("Invalid student ID", 400);

  const students = await User.findAll({
    where: { user_id: user_ids,  },
  });

  await Promise.all(
    students.map(async (student) => {
      await student.update({ is_approved });
    })
  );

  return students as UserInstance[];
};

export const getStudentsBySchool = async (
  school_id: string,
  session_id: string,
  term_id: string
): Promise<UserInstance[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const students = await User.findAll({
    where: { school_id, role: "Student" },
    attributes: [
      "user_id",
      "email",
      "first_name",
      "last_name",
      "gender",
      "is_approved",
      "created_at", // ✅ Include this
    ],
    include: [
      {
        model: ClassStudent,
        where: { session_id, term_id },
        as: "class_students",
        include: [
          {
            model: Class,
            attributes: ["name", "grade_level", "class_id"],
          },
        ],
      },
    ],
  });

  return students as UserInstance[];
};

export const getStudentBySchool = async (school_id: string): Promise<any[]> => {
  // also sending the class of the student
  if (!validateUUID(school_id)) throw new AppError("Invalid school id", 400);
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const students = await User.findAll({
    where: { school_id },
    include: [
      {
        model: User,
        attributes: [
          "user_id",
          "username",
          "email",
          "first_name",
          "last_name",
          "role",
          "school_id",
          "is_approved",
        ],
      },
      {
        model: Class,
        attributes: ["class_id", "name", "grade_level"],
      },
    ],
  });
  return students;
};

export const deleteUser = async (user_id: string): Promise<void> => {
  if (!validateUUID(user_id)) throw new AppError("Invalid user ID", 400);

  const user = await User.findByPk(user_id);
  if (!user) throw new AppError("User not found", 404);

  await user.destroy();
};
