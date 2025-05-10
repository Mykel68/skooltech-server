import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import { SchoolInstance } from "../types/models.types";

const School = sequelize.define<SchoolInstance>(
  "School",
  {
    school_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    school_image: { type: DataTypes.STRING, allowNull: true },
    phone_number: { type: DataTypes.STRING, allowNull: true },
    school_code: { type: DataTypes.STRING, allowNull: true, unique: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "schools" }
);

export default School;
