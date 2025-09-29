import { StudentLinkCode, User } from "../models";
import { addMinutes } from "../utils/date.util";

export const createStudentLinkCode = async (student_id: string) => {
  const student = await User.findOne({
    where: { user_id: student_id, role_id: 9 },
  });
  if (!student) throw new Error("Student not found");

  const code = await StudentLinkCode.create({
    student_user_id: student.user_id,
    code: crypto.randomUUID(),
    expires_at: addMinutes(new Date(), 15),
  });

  return code;
};
