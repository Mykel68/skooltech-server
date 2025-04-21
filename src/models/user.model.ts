import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import { UserInstance } from "../types/models.types";

const User = sequelize.define<UserInstance>(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    school_id: { type: DataTypes.UUID, allowNull: false },
    role: {
      type: DataTypes.ENUM("Admin", "Teacher", "Student", "Parent"),
      allowNull: false,
    },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    first_name: { type: DataTypes.STRING, allowNull: true },
    last_name: { type: DataTypes.STRING, allowNull: true },
    is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "users" }
);

export default User;
