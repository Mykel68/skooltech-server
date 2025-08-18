import bcrypt from "bcrypt";
import { Role, School, User } from "../models";

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
    total: await User.count(),
    activeUsers: await User.count({ where: { is_active: true } }),
    activeSchools: await School.count({ where: { is_active: true } }),
    pendingSchools: await School.count({ where: { is_active: false } }),
    totalSchools: await School.count(),
  };
};

export const getAllSchools = async () => {
  const schools = await School.findAll({
    include: [
      {
        model: User,
        as: "users",
      },
    ],
  });

  return schools.map((s: any) => ({
    id: s.school_id,
    name: s.name,
    email: s.users[0]?.email || null, // maybe admin’s email
    status: s.is_active ? "active" : "pending", // map boolean to string
    subscriptionPlan: "basic", // or fetch from Subscription table if you have it
    totalUsers: s.users.length,
    totalRevenue: 0, // placeholder until you track revenue
    createdAt: s.users[0]?.created_at || null, // maybe admin’s created_at
    logo: s.school_image || null,
    // users: s.users,
  }));
};

export const getAllUsers = async () => {
  const users = await User.findAll({
    include: [
      { model: Role, as: "role", attributes: ["role_id", "name"] },
      { model: School, as: "school", attributes: ["school_id", "name"] },
    ],
    attributes: ["user_id", "username", "email", "is_active", "createdAt"],
  });

  return users.map((u: any) => ({
    id: u.user_id,
    name: u.username, // ✅ correct field
    email: u.email,
    status: u.is_active ? "active" : "inactive",
    role: u.role ? u.role.name : null, // ✅ guard against undefined
    school: u.school ? u.school.name : null,
    createdAt: u.createdAt,
  }));
};
