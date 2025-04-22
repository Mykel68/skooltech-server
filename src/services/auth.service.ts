import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import School from "../models/school.model";
import { AppError } from "../utils/error.util";
import { UserInstance } from "../types/models.types";

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
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return token;
};
