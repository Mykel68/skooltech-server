import User from "../models/user.model";
import ParentStudent from "../models/parent_student.model";
import { AppError } from "../utils/error.util";
import { Class, ClassStudent } from "../models";

export const linkParentToStudent = async ({
  parent_user_id,
  student_admission_number,
  school_id,
}: {
  parent_user_id: string;
  student_admission_number: string;
  school_id: string;
}) => {
  // Check if parent exists and is role Parent
  const parent = await User.findOne({
    where: { user_id: parent_user_id, role: "Parent" },
  });
  if (!parent) throw new AppError("Parent account not found", 404);

  // Find the student by admission number and school
  const student = await User.findOne({
    where: {
      admission_number: student_admission_number,
      school_id,
      role: "Student",
    },
  });
  if (!student)
    throw new AppError("Student with this admission number not found", 404);

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

  // approve the parent
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
    where: { user_id: parent_user_id, role: "Parent" },
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
      role: "Student",
    },
    include: [
      {
        model: ClassStudent,
        as: "class_students",
        required: false,
        include: [
          {
            model: Class,
            as: "class",
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
