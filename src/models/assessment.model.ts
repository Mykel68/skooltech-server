import { DataTypes } from "sequelize";
import sequelize from "../config/db";
import Subject from "./subject.model";
import Class from "./class.model";
import { AssessmentInstance } from "../types/models.types";
import { Term } from "./term.model";

const Assessment = sequelize.define<AssessmentInstance>(
  "Assessment",
  {
    assessment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Class, key: "class_id" },
    },
    subject_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Subject, key: "subject_id" },
    },
    term_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Term, key: "term_id" },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("Exam", "Quiz", "Assignment"),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    max_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 100,
    },
  },
  {
    tableName: "assessments",
    timestamps: true,
    underscored: true,
  }
);

Assessment.belongsTo(Subject, { foreignKey: "subject_id" });
Subject.hasMany(Assessment, { foreignKey: "subject_id" });
Assessment.belongsTo(Class, { foreignKey: "class_id" });
Class.hasMany(Assessment, { foreignKey: "class_id" });
Assessment.belongsTo(Term, { foreignKey: "term_id" });
Term.hasMany(Assessment, { foreignKey: "term_id" });

export default Assessment;
