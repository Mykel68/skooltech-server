import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import { GradingConfigInstance } from "../types/models.types";

const GradingConfig = sequelize.define<GradingConfigInstance>(
  "GradingConfig",
  {
    config_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: School, key: "school_id" },
    },
    assessment_type: {
      type: DataTypes.ENUM("Exam", "Quiz", "Assignment"),
      allowNull: false,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0, max: 1 },
    },
  },
  {
    tableName: "grading_configs",
    timestamps: true,
    underscored: true,
  }
);

GradingConfig.belongsTo(School, { foreignKey: "school_id" });
School.hasMany(GradingConfig, { foreignKey: "school_id" });

export default GradingConfig;
