import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import GradingConfig from "../models/grading_config.model";
import School from "../models/school.model";

export class GradingConfigService {
  async createGradingConfig(
    school_id: string,
    assessment_type: "Exam" | "Quiz" | "Assignment",
    weight: number
  ): Promise<GradingConfig> {
    if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
    if (!["Exam", "Quiz", "Assignment"].includes(assessment_type))
      throw new AppError("Invalid assessment type", 400);
    if (weight < 0 || weight > 1)
      throw new AppError("Weight must be between 0 and 1", 400);

    const school = await School.findByPk(school_id);
    if (!school) throw new AppError("School not found", 404);

    const existingConfig = await GradingConfig.findOne({
      where: { school_id, assessment_type },
    });
    if (existingConfig)
      throw new AppError(
        "Grading config for this assessment type already exists",
        400
      );

    const totalWeight = await GradingConfig.sum("weight", {
      where: { school_id },
    });
    if (totalWeight + weight > 1)
      throw new AppError("Total weight cannot exceed 1", 400);

    const config = await GradingConfig.create({
      school_id,
      assessment_type,
      weight,
    });
    return config;
  }

  async updateGradingConfig(
    config_id: string,
    weight: number
  ): Promise<GradingConfig> {
    if (!validateUUID(config_id)) throw new AppError("Invalid config ID", 400);
    if (weight < 0 || weight > 1)
      throw new AppError("Weight must be between 0 and 1", 400);

    const config = await GradingConfig.findByPk(config_id);
    if (!config) throw new AppError("Grading config not found", 404);

    const totalWeight = await GradingConfig.sum("weight", {
      where: { school_id: config.school_id, config_id: { [Op.ne]: config_id } },
    });
    if (totalWeight + weight > 1)
      throw new AppError("Total weight cannot exceed 1", 400);

    await config.update({ weight });
    return config;
  }
}
