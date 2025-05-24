import Class from "../models/class.model";
import User from "../models/user.model";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";

export const getTeacherByClass = async (
  school_id: string,
  student_id: string,
  class_id: string
): Promise<any[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!validateUUID(student_id)) throw new AppError("Invalid class ID", 400);
  if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);

  // Verify class belongs to the school
  const classRecord = await Class.findOne({
    where: { class_id: school_id },
  });
  if (!classRecord) throw new AppError("Class not found in this school", 404);

  // get teachers teaching a particular class
  const teachers = await Class.findAll({
    where: { class_id },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["first_name", "last_name"],
      },
    ],
    order: [
      ["user", "last_name", "ASC"],
      ["user", "first_name", "ASC"],
    ],
  });

  return teachers.map((teacher) => ({
    ...teacher.user.toJSON(),
  }));
};
