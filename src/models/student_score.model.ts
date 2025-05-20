import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import Class from "./class.model";
import GradingSetting from "./grading_setting.model";
import School from "./school.model";
import ClassStudent from "./class_student.model";

interface StudentScoreAttributes {
  score_id?: string;
  grading_setting_id: string;
  user_id: string;
  class_id: string;
  teacher_id: string;
  school_id: string;
  scores: {
    component_name: string;
    score: number;
  }[];
  total_score: number;
}

interface StudentScoreInstance
  extends Model<StudentScoreAttributes>,
    StudentScoreAttributes {}

const StudentScore = sequelize.define<StudentScoreInstance>(
  "StudentScore",
  {
    score_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    grading_setting_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: GradingSetting, key: "grading_setting_id" },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "user_id" },
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Class, key: "class_id" },
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "user_id" },
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "schools", key: "school_id" },
    },
    scores: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidScores(value: { component_name: string; score: number }[]) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Scores must be a non-empty array");
          }
          value.forEach((score, index) => {
            if (
              !score.component_name ||
              typeof score.component_name !== "string" ||
              score.component_name.trim() === ""
            ) {
              throw new Error(
                `Score at index ${index} is missing a valid component name`
              );
            }
            if (
              typeof score.score !== "number" ||
              isNaN(score.score) ||
              score.score < 0 ||
              score.score > 100
            ) {
              throw new Error(
                `Score for "${score.component_name}" is invalid: ${score.score}`
              );
            }
          });
        },
      },
    },
    total_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    tableName: "student_scores",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["grading_setting_id", "user_id", "class_id"],
      },
    ],
  }
);

StudentScore.belongsTo(School, { foreignKey: "school_id", as: "school" });
StudentScore.belongsTo(Class, { foreignKey: "class_id", as: "class" });
StudentScore.belongsTo(User, { foreignKey: "user_id", as: "student" });
StudentScore.belongsTo(ClassStudent, {
  foreignKey: "class_id",
  as: "class_student",
});
StudentScore.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
StudentScore.belongsTo(GradingSetting, {
  foreignKey: "grading_setting_id",
  as: "grading_setting",
});

export default StudentScore;
export { StudentScoreInstance };
