import User from "../models/user.model";
import ParentStudent from "../models/parent_student.model";
import { AppError } from "../utils/error.util";

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

  return {
    student_id: student.user_id,
    admission_number: student.admission_number,
    first_name: student.first_name,
    last_name: student.last_name,
  };
};
