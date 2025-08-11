import User from "../models/user.model";
import Class from "../models/class.model";
import Payment from "../models/payment.model"; // Assuming you have a model for revenue
import { Op } from "sequelize";
import { getPreviousMonthRange } from "../utils/date.util"; // Helper to calculate last month range
import { ClassStudent } from "../models";

export const getDashboardStats = async (
  school_id: string,
  session_id: string,
  term_id: string
) => {
  // Total counts
  const totalStudents = await ClassStudent.count({
    where: { session_id, term_id },
  });
  const totalTeachers = await User.count({
    where: {
      school_id,
      role_id: 3, // Teacher
    },
  });
  const totalClasses = await Class.count({ where: { school_id } });
  const totalRevenue =
    (await Payment.sum("amount", { where: { school_id } })) || 0;

  // Previous month stats (for growth)
  const { start, end } = getPreviousMonthRange();

  const lastMonthStudents = await User.count({
    where: {
      school_id,
      role_id: 4, // Student
      created_at: { [Op.between]: [start, end] },
    },
  });

  const lastMonthTeachers = await User.count({
    where: {
      school_id,
      role_id: 3, // Teacher
      created_at: { [Op.between]: [start, end] },
    },
  });

  const lastMonthClasses = await Class.count({
    where: {
      school_id,
      created_at: { [Op.between]: [start, end] },
    },
  });

  const lastMonthRevenue =
    (await Payment.sum("amount", {
      where: {
        school_id,
        created_at: { [Op.between]: [start, end] },
      },
    })) || 0;

  return {
    totalStudents,
    totalTeachers,
    totalClasses,
    totalRevenue,
    studentGrowth: (lastMonthStudents / totalStudents) * 100 || 0,
    teacherGrowth: (lastMonthTeachers / totalTeachers) * 100 || 0,
    classGrowth: (lastMonthClasses / totalClasses) * 100 || 0,
    revenueGrowth: (lastMonthRevenue / totalRevenue) * 100 || 0,
  };
};
