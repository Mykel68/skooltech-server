import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import { GradeScaleInstance } from '../types/models.types';

const GradeScale = sequelize.define<GradeScaleInstance>('GradeScale', {
  scale_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  school_id: { type: DataTypes.UUID, allowNull: false },
  letter_grade: { type: DataTypes.STRING, allowNull: false },
  min_score: { type: DataTypes.FLOAT, allowNull: false },
  max_score: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'grade_scales' });

GradeScale.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(GradeScale, { foreignKey: 'school_id' });

export default GradeScale;