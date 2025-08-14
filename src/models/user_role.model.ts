import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import Role, { RoleInstance } from "./role.model";

export interface UserRoleAttributes {
  user_id: string;
  role_id: number;
  role_name?: string;
}

export interface UserRoleInstance
  extends Model<UserRoleAttributes>,
    UserRoleAttributes {
  Role?: RoleInstance; // 👈 Add this line
  role_name?: string;
}

export class UserRole
  extends Model<UserRoleAttributes>
  implements UserRoleAttributes
{
  user_id!: string;
  role_id!: number;
}

UserRole.init(
  {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "role_id",
      },
    },
  },
  {
    sequelize,
    modelName: "UserRole",
    tableName: "user_roles",
    timestamps: false,
    underscored: true,
  }
);
