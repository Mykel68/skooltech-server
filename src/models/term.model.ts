import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import Session from "./session.model";
import { TermInstance } from "../types/models.types";

const Term = sequelize.define<TermInstance>(
  "Term",
  {
    term_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: School, key: "school_id" },
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Session, key: "session_id" },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: "terms",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["session_id", "name"],
      },
    ],
  }
);

Term.belongsTo(School, { foreignKey: "school_id" });
School.hasMany(Term, { foreignKey: "school_id" });
Term.belongsTo(Session, { foreignKey: "session_id" });
Session.hasMany(Term, { foreignKey: "session_id" });

export default Term;
