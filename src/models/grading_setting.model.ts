import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Class from "./class.model";
import User from "./user.model";
import School from "./school.model";
import Subject from "./subject.model";

interface GradingSettingAttributes {
  grading_setting_id?: string;
  class_id: string;
  teacher_id: string;
  school_id: string;
  subject_id: string; // ← newly added
  components: {
    name: string;
    weight: number;
  }[];
}

interface GradingSettingInstance
  extends Model<GradingSettingAttributes>,
    GradingSettingAttributes {}

const GradingSetting = sequelize.define<GradingSettingInstance>(
  "GradingSetting",
  {
    grading_setting_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    subject_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Subject, key: "subject_id" }, // ← newly added
    },
    components: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidComponents(value: { name: string; weight: number }[]) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Components must be a non-empty array");
          }
          const totalWeight = value.reduce((sum, comp) => sum + comp.weight, 0);
          if (totalWeight !== 100) {
            throw new Error("Component weights must sum to 100%");
          }
          value.forEach((comp) => {
            if (
              !comp.name ||
              typeof comp.weight !== "number" ||
              comp.weight < 0 ||
              comp.weight > 100
            ) {
              throw new Error("Invalid component name or weight");
            }
          });
        },
      },
    },
  },
  {
    tableName: "grading_settings",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        // previously was fields: ["class_id", "teacher_id"]
        // Now make the tuple (class_id, subject_id, teacher_id) unique:
        fields: ["class_id", "subject_id", "teacher_id"],
      },
    ],
  }
);

// Associations
GradingSetting.belongsTo(School, { foreignKey: "school_id", as: "school" });
GradingSetting.belongsTo(Class, { foreignKey: "class_id", as: "class" });
GradingSetting.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
GradingSetting.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

export default GradingSetting;
export { GradingSettingInstance };
