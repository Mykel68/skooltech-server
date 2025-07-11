import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

interface StudentLinkCodeAttributes {
  student_user_id: string;
  code: string;
  expires_at: Date;
  used_at?: Date;
}

interface StudentLinkCodeCreationAttributes
  extends Optional<StudentLinkCodeAttributes, "student_user_id"> {}

export type StudentLinkCodeInstance = Model<
  StudentLinkCodeAttributes,
  StudentLinkCodeCreationAttributes
> &
  StudentLinkCodeAttributes;

// Define the model with typings for instance and creation attributes
const StudentLinkCode = sequelize.define<
  Model<StudentLinkCodeAttributes, StudentLinkCodeCreationAttributes>
>(
  "StudentLinkCode",
  {
    student_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
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
  }
);

// Association

export default StudentLinkCode;
