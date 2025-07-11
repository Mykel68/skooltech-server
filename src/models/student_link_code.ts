import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

export interface StudentLinkCodeAttributes {
  id: string;
  student_user_id: string;
  code: string;
  expires_at: Date;
  used_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

interface CreationAttributes
  extends Optional<
    StudentLinkCodeAttributes,
    "id" | "used_at" | "created_at" | "updated_at"
  > {}

export interface StudentLinkCodeInstance
  extends Model<StudentLinkCodeAttributes, CreationAttributes>,
    StudentLinkCodeAttributes {}

const StudentLinkCode = sequelize.define<StudentLinkCodeInstance>(
  "student_link_code",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "student_link_codes",
    timestamps: true,
    underscored: true,
  }
);

export default StudentLinkCode;
