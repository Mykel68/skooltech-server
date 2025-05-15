import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import { ClassInstance } from "../types/models.types";

const Class = sequelize.define<ClassInstance>(
  "Class",
  {
    class_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: School, key: "school_id" },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    short: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grade_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "classes",
    timestamps: true,
    underscored: true,
  }
);

Class.belongsTo(School, { foreignKey: "school_id" });
School.hasMany(Class, { foreignKey: "school_id" });

export default Class;
