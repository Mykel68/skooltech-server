import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import Class from "./class.model";
import User from "./user.model";
import { SubjectInstance } from "../types/models.types";

const Subject = sequelize.define<SubjectInstance>(
  "Subject",
  {
    subject_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: School, key: "school_id" },
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    short: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "subjects",
    timestamps: true,
    underscored: true,
  }
);

Subject.belongsTo(School, { foreignKey: "school_id" });
School.hasMany(Subject, { foreignKey: "school_id" });
Subject.belongsTo(Class, { foreignKey: "class_id", as: "class" });
Class.hasMany(Subject, { foreignKey: "class_id", as: "subjects" });
Subject.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
User.hasMany(Subject, { foreignKey: "teacher_id", as: "subjects" });

export default Subject;
