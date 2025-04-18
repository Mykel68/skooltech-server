import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import { SubjectInstance } from '../types/models.types';


const Subject = sequelize.define<SubjectInstance>('Subject', {
  subject_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  school_id: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'subjects' });

Subject.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(Subject, { foreignKey: 'school_id' });

export default Subject;