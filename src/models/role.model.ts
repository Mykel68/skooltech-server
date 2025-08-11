import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface RoleAttributes {
  role_id: number;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

type RoleCreationAttributes = Optional<
  RoleAttributes,
  "role_id" | "description" | "created_at" | "updated_at"
>;

class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public role_id!: number;
  public name!: string;
  public description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Role.init(
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
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
    underscored: true,
  }
);

export default Role;
