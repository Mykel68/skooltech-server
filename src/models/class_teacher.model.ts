import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Class from "./class.model";
import User from "./user.model";
import Subject from "./subject.model";
import { SubjectInstance, UserInstance } from "../types/models.types";

interface ClassTeacherAttributes {
  class_teacher_id: string;
  class_id: string;
  teacher_id: string;
  subject_id: string;
  school_id: string;
}

interface ClassTeacherInstance
  extends Model<ClassTeacherAttributes>,
    ClassTeacherAttributes {
  teacher?: UserInstance;
  subject?: SubjectInstance;
}

const ClassTeacher = sequelize.define<ClassTeacherInstance>(
  "ClassTeacher",
  {
    class_teacher_id: {
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
    subject_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Subject, key: "subject_id" },
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "schools", key: "school_id" },
    },
  },
  {
    tableName: "class_teachers",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["class_id", "teacher_id", "subject_id"],
      },
    ],
  }
);

ClassTeacher.belongsTo(Class, { foreignKey: "class_id", as: "class" });
ClassTeacher.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
ClassTeacher.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
Class.hasMany(ClassTeacher, { foreignKey: "class_id", as: "class_teachers" });
User.hasMany(ClassTeacher, { foreignKey: "teacher_id", as: "class_teachers" });
Subject.hasMany(ClassTeacher, {
  foreignKey: "subject_id",
  as: "class_teachers",
});

export default ClassTeacher;
export { ClassTeacherInstance };
