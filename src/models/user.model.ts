import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import { ClassInstance } from "./class.model";
import { AttendanceInstance } from "./attendance.model";
import { StudentScoreInstance } from "./student_score.model";

// Define attributes and instance
export interface UserAttributes {
  user_id: string;
  school_id: string;
  role: "Admin" | "Teacher" | "Student" | "Parent";
  username: string;
  password_hash: string;
  email: string;
  first_name?: string;
  last_name?: string;
  gender?: "Male" | "Female" | null;
  is_approved?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  admission_number?: string;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "user_id" | "created_at" | "updated_at"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  attendances?: AttendanceInstance[];
  student_scores?: StudentScoreInstance;
  class_students?: ClassInstance[];
}

const User = sequelize.define<UserInstance>(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: School,
        key: "school_id",
      },
    },
    role: {
      type: DataTypes.ENUM("Admin", "Teacher", "Student", "Parent"),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: true,
      defaultValue: null,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    admission_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["school_id", "admission_number"],
        name: "unique_admission_number_per_school",
      },
    ],
  }
);

export default User;
