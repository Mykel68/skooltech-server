import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import Class from './class.model';
import Subject from './subject.model';
import { AssessmentInstance } from '../types/models.types';

const Assessment = sequelize.define<AssessmentInstance>('Assessment', {
  assessment_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  class_id: { type: DataTypes.UUID, allowNull: false },
  subject_id: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('Exam', 'Quiz', 'Assignment'), allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  max_score: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'assessments' });

Assessment.belongsTo(Class, { foreignKey: 'class_id' });
Assessment.belongsTo(Subject, { foreignKey: 'subject_id' });

export default Assessment;