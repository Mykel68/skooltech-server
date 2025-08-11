import bcrypt from "bcrypt";
import User from "../models/user.model";

export const createSuperAdmin = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await User.create({
    role: "SuperAdmin",
    username: data.username,
    password_hash: hashedPassword,
    email: data.email,
    first_name: "Super",
    last_name: "Admin",
    is_approved: true,
    is_active: true,
  });
};
