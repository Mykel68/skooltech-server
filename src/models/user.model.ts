import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import { ClassInstance } from "./class.model";
import { AttendanceInstance } from "./attendance.model";
import { StudentScoreInstance } from "./student_score.model";
import { RoleInstance } from "./role.model";

export interface UserAttributes {
  user_id: string;
  school_id?: string | null; // Optional for SuperAdmin
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
  role_id?: number;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "user_id" | "created_at" | "updated_at"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  attendances?: AttendanceInstance[];
  student_scores?: StudentScoreInstance;
  class_students?: ClassInstance[];
  roles?: RoleInstance[];
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
      allowNull: true,
      references: {
        model: School,
        key: "school_id",
      },
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
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
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
