import bcrypt from "bcrypt";
import User from "../models/user.model";
import { School } from "../models";

export const createSuperAdmin = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await User.create({
    role_id: 1, // Super Admin
    username: data.username,
    password_hash: hashedPassword,
    email: data.email,
    first_name: "Super",
    last_name: "Admin",
    is_approved: true,
    is_active: true,
  });
};

export const getAppData = async (userId: string) => {
  const user = await User.findOne({ where: { user_id: userId } });

  // verify user is a super admin
  if (user?.role_id !== 1) {
    throw new Error("User is not a super admin");
  }

  return {
    totalUsers: await User.count(),
    activeUsers: await User.count({ where: { is_active: true } }),
    approvedUsers: await User.count({ where: { is_approved: true } }),
    pendingUsers: await User.count({ where: { is_approved: false } }),
    totalSchools: await School.count(),
  };
};
