import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

// Role attributes
export interface RoleAttributes {
  role_id: number;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields when creating a new role
export type RoleCreationAttributes = Optional<
  RoleAttributes,
  "role_id" | "description" | "created_at" | "updated_at"
>;

// Exported RoleInstance type to use in associations
export interface RoleInstance
  extends Model<RoleAttributes, RoleCreationAttributes>,
    RoleAttributes {}

const Role = sequelize.define<RoleInstance>(
  "Role",
  {
    role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "roles",
    modelName: "Role", // optional
    timestamps: true,
    underscored: true,
  }
);

export default Role;
