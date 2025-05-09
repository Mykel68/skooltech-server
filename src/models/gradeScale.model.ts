import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import { GradeScaleInstance } from "../types/models.types";

const GradeScale = sequelize.define<GradeScaleInstance>(
  "GradeScale",
  {
    scale_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: School, key: "school_id" },
    },
    letter_grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    min_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
    max_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "grade_scales",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["school_id", "letter_grade"],
      },
    ],
  }
);

GradeScale.belongsTo(School, { foreignKey: "school_id" });
School.hasMany(GradeScale, { foreignKey: "school_id" });

export default GradeScale;
