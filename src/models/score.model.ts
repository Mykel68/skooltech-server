import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';
import Assessment from './assessment.model';
import { ScoreInstance } from '../types/models.types';

const Score = sequelize.define<ScoreInstance>('Score', {
  score_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  student_id: { type: DataTypes.UUID, allowNull: false },
  assessment_id: { type: DataTypes.UUID, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'scores' });

Score.belongsTo(User, { foreignKey: 'student_id' });
Score.belongsTo(Assessment, { foreignKey: 'assessment_id' });

export default Score;