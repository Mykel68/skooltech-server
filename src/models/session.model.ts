import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import { SessionInstance } from "../types/models.types";

const Session = sequelize.define<SessionInstance>(
  "Session",
  {
    session_id: {
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "sessions",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["school_id", "name"],
      },
    ],
  }
);

Session.belongsTo(School, { foreignKey: "school_id" });
School.hasMany(Session, { foreignKey: "school_id" });

export default Session;
