import User from "../models/user.model";
import ParentStudent from "../models/parent_student.model";
import { AppError } from "../utils/error.util";
import {
  Attendance,
  Class,
  ClassStudent,
  Message,
  StudentLinkCode,
  StudentScore,
} from "../models";
import { Op } from "sequelize";
import AttendanceLog from "../models/attendanceLog";

export const linkParentToStudent = async ({
  parent_user_id,
  student_admission_number,
  code,
  school_id,
}: {
  parent_user_id: string;
  student_admission_number?: string;
  code?: string;
  school_id: string;
}) => {
  // Check if parent exists and is role Parent
  const parent = await User.findOne({
    where: {
      user_id: parent_user_id,
      role_id: 5, // Parent
    },
  });
  if (!parent) throw new AppError("Parent account not found", 404);

  let student;

  if (student_admission_number) {
    // Try by admission number
    student = await User.findOne({
      where: {
        admission_number: student_admission_number,
        school_id,
        role_id: 4, // Student
      },
    });
    if (!student)
      throw new AppError("Student with this admission number not found", 404);
  } else if (code) {
    // Try by linking code
    const linkCode = await StudentLinkCode.findOne({
      where: {
        code,
        expires_at: { [Op.gt]: new Date() },
        used_at: null,
      },
    });
    if (!linkCode) throw new AppError("Invalid or expired linking code", 400);

    student = await User.findOne({
      where: {
        user_id: linkCode.student_user_id,
        school_id,
        role_id: 4, // Student
      },
    });
    if (!student)
      throw new AppError("Student for this code not found in this school", 404);

    // Mark code as used
    await linkCode.update({ used_at: new Date() });
  } else {
    throw new AppError("Either admission_number or code must be provided", 400);
  }

  // Check if already linked
  const existing = await ParentStudent.findOne({
    where: {
      parent_user_id,
      student_user_id: student.user_id,
    },
  });
  if (existing)
    throw new AppError("This student is already linked to your account", 400);

  // Create the link
  await ParentStudent.create({
    parent_user_id,
    student_user_id: student.user_id,
  });

  // Approve the parent if not already
  if (!parent.is_approved) {
    await parent.update({ is_approved: true });
  }

  return {
    student_id: student.user_id,
    admission_number: student.admission_number,
    first_name: student.first_name,
    last_name: student.last_name,
  };
};

export const getLinkedChildrenOfParent = async ({
  parent_user_id,
  school_id,
}: {
  parent_user_id: string;
  school_id: string;
}) => {
  // 1. Verify parent exists
  const parent = await User.findOne({
    where: {
      user_id: parent_user_id,
      role_id: 5, // Parent
    },
  });
  if (!parent) throw new AppError("Parent account not found", 404);

  // 2. Find all links
  const links = await ParentStudent.findAll({
    where: { parent_user_id },
  });
  if (links.length === 0) return [];

  const studentIds = links.map((link) => link.student_user_id);

  // 3. Fetch all students
  const students = await User.findAll({
    where: {
      user_id: studentIds,
      school_id,
      role_id: 4, // Student
    },
    include: [
      {
        model: ClassStudent,
        as: "class_students",
        required: false,
        include: [
          {
            model: Class,
          },
        ],
      },
    ],
  });

  // 4. Format response
  return students.map((student) => {
    // Get latest class_student entry if exists
    const classStudent = student.class_students?.[0];

    return {
      id: student.user_id,
      admission_number: student.admission_number,
      name: `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim(),
      gender: student.gender,
      class: classStudent
        ? {
            id: classStudent.class_id,
            name: classStudent.Class?.name,
            grade_level: classStudent.Class?.grade_level,
            // session_id: classStudent.Session?.session_id,
            // term_id: classStudent.term_id,
          }
        : null,
    };
  });
};

export const parentStats = async ({
  parent_user_id,
  school_id,
}: {
  parent_user_id: string;
  school_id: string;
}) => {
  // 1. Verify parent exists
  const parent = await User.findOne({
    where: {
      user_id: parent_user_id,
      role_id: 5, // Parent
    },
  });
  if (!parent) throw new AppError("Parent account not found", 404);

  // 2. Find all links
  const links = await ParentStudent.findAll({
    where: { parent_user_id },
  });
  if (links.length === 0) return [];

  const studentIds = links.map((link) => link.student_user_id);

  // 3. Fetch all students
  const students = await User.findAll({
    where: {
      user_id: studentIds,
      school_id,
      role_id: 4, // Student
    },
    include: [
      {
        model: AttendanceLog,
        as: "student_attendances",
        where: { student_id: studentIds },
        order: [["date", "DESC"]],
      },
      {
        model: StudentScore,
        where: { user_id: studentIds },
        as: "student_scores",
        limit: 5,
        order: [["createdAt", "DESC"]],
        attributes: ["scores"],
      },
      {
        model: ClassStudent,
        as: "class_students",
        include: [
          {
            model: Class,
          },
        ],
      },
    ],
  });

  // 4. Optional: Fetch school-wide announcements or activities
  const announcements = await Message.findAll({
    where: {
      school_id,
      target_role: { [Op.or]: ["Parent", "Student"] },
      message_type: "announcement",
    },
    order: [["sent_at", "DESC"]],
    limit: 5,
  });

  const activities = await Message.findAll({
    where: { school_id, message_type: "urgent" },
    order: [["sent_at", "DESC"]],
    limit: 5,
  });

  return {
    total_students: students.length,
    students: students.map((student) => ({
      user_id: student.user_id,
      full_name: student.first_name + " " + student.last_name,
      gender: student.gender,
      class: student.class_students?.[0]?.Class?.name,
      attendances: student.attendances,
      results: student.student_scores,
    })),
    school: {
      announcements,
      activities,
    },
  };
};

export const childResults = async ({
  parent_user_id,
  school_id,
}: {
  parent_user_id: string;
  school_id: string;
}) => {
  // 1. Verify parent exists
  const parent = await User.findOne({
    where: {
      user_id: parent_user_id,
      role_id: 5, // Parent
    },
  });
  if (!parent) throw new AppError("Parent account not found", 404);

  // 2. Get all linked students
  const links = await ParentStudent.findAll({
    where: { parent_user_id },
  });
  if (links.length === 0) return [];

  const studentIds = links.map((link) => link.student_user_id);

  // 3. Fetch only student results
  const students = await User.findAll({
    where: {
      user_id: studentIds,
      school_id,
      role_id: 4, // Student
    },
    include: [
      {
        model: StudentScore,
        as: "student_scores", // Make sure this alias matches your association
      },
    ],
  });

  // 4. Return only results per student
  return students.map((student) => ({
    user_id: student.user_id,
    full_name: `${student.first_name} ${student.last_name}`,
    results: student.student_scores, // This should contain the scores per subject
  }));
};
