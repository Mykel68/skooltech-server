import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import { GradingConfigInstance } from '../types/models.types';

const GradingConfig = sequelize.define<GradingConfigInstance>('GradingConfig', {
  config_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  school_id: { type: DataTypes.UUID, allowNull: false },
  assessment_type: { type: DataTypes.STRING, allowNull: false },
  weight: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'grading_configs' });

GradingConfig.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(GradingConfig, { foreignKey: 'school_id' });

export default GradingConfig;