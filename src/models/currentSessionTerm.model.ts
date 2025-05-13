import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import School from "./school.model";
import Session from "./session.model";
import Term from "./term.model";

const CurrentSessionTerm = sequelize.define(
  "CurrentSessionTerm",
  {
    school_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: { model: School, key: "school_id" },
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Session, key: "session_id" },
    },
    term_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Term, key: "term_id" },
    },
  },
  {
    tableName: "current_session_term",
    timestamps: true,
    underscored: true,
  }
);

export default CurrentSessionTerm;
