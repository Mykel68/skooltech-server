import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

interface SchoolAttributes {
  school_id?: string;
  name: string;
  address?: string;
  school_image?: string;
  phone_number?: string;
  school_code?: string;
  is_active?: boolean;
  motto?: string;
}

export interface SchoolRegistrationData {
  name: string;
  address?: string;
  school_image?: string | null;
  phone_number?: string | null;
  school_code?: string | null;
  admin_username: string;
  admin_password: string;
  admin_email: string;
  admin_first_name?: string;
  admin_last_name?: string;
  gender?: "Male" | "Female";
}

interface SchoolInstance extends Model<SchoolAttributes>, SchoolAttributes {}

const School = sequelize.define<SchoolInstance>(
  "School",
  {
    school_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    school_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    school_code: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    motto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "schools",
    timestamps: false,
    underscored: true,
  }
);

export default School;
export { SchoolAttributes, SchoolInstance };
