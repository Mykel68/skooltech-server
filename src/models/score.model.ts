import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import Assessment from "./assessment.model";
import { ScoreInstance } from "../types/models.types";

const Score = sequelize.define<ScoreInstance>(
  "Score",
  {
    score_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "user_id" },
    },
    assessment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Assessment, key: "assessment_id" },
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: "scores",
    timestamps: true,
    underscored: true,
  }
);

Score.belongsTo(User, { foreignKey: "student_id", as: "student" });
User.hasMany(Score, { foreignKey: "student_id", as: "scores" });
Score.belongsTo(Assessment, { foreignKey: "assessment_id" });
Assessment.hasMany(Score, { foreignKey: "assessment_id" });

export default Score;
