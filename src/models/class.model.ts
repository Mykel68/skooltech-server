import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import { ClassInstance } from '../types/models.types';

const Class = sequelize.define<ClassInstance>('Class', {
  class_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  school_id: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  grade_level: { type: DataTypes.STRING },
}, { tableName: 'classes' });

Class.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(Class, { foreignKey: 'school_id' });

export default Class;