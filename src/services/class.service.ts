import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Class from "../models/class.model";
import School from "../models/school.model";

export class ClassService {
  async createClass(
    school_id: string,
    name: string,
    grade_level?: string
  ): Promise<Class> {
    if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
    if (!name) throw new AppError("Class name is required", 400);

    const school = await School.findByPk(school_id);
    if (!school) throw new AppError("School not found", 404);

    const classInstance = await Class.create({ school_id, name, grade_level });
    return classInstance;
  }

  async getClass(class_id: string, school_id: string): Promise<Class> {
    if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
    if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

    const classInstance = await Class.findOne({
      where: { class_id, school_id },
    });
    if (!classInstance) throw new AppError("Class not found", 404);

    return classInstance;
  }
}
