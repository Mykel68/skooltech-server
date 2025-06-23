import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import Class from "./class.model";
import School from "./school.model";
import GradingSetting, {
  GradingSettingInstance,
} from "./grading_setting.model";
import ClassStudent from "./class_student.model";
import Subject, { SubjectInstance } from "./subject.model";
import { SessionInstance } from "./session.model";
import { TermInstance } from "./term.model";

interface StudentScoreAttributes {
  score_id?: string;
  subject_id: string;
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
    StudentScoreAttributes {
  subject: SubjectInstance;
  grading_setting: GradingSettingInstance;
  session: SessionInstance;
  term: TermInstance;
}

const StudentScore = sequelize.define<StudentScoreInstance>(
  "StudentScore",
  {
    score_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subject_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Subject, key: "subject_id" },
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
      references: { model: School, key: "school_id" },
    },
    scores: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidScores(value: { component_name: string; score: number }[]) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Scores must be a non-empty array");
          }
          value.forEach((score, i) => {
            if (
              !score.component_name ||
              typeof score.component_name !== "string" ||
              score.component_name.trim() === ""
            ) {
              throw new Error(
                `Score at index ${i} is missing a valid component name`
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

// Associations

export default StudentScore;
export { StudentScoreAttributes, StudentScoreInstance };
