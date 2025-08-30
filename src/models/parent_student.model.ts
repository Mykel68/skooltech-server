import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import { ClassStudentInstance } from "./class_student.model";

export interface ParentStudentAttributes {
  id?: string;
  parent_user_id: string;
  student_user_id: string;
  created_at?: Date;
}

export interface ParentStudentInstance
  extends Model<ParentStudentAttributes>,
    ParentStudentAttributes {
  classStudent?: ClassStudentInstance;
}

const ParentStudent = sequelize.define<ParentStudentInstance>(
  "ParentStudent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    parent_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    student_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "parent_students",
    timestamps: true,
    underscored: true,
  }
);

export default ParentStudent;
