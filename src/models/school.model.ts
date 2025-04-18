import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
const School = sequelize.define('School', {
  school_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
}, { tableName: 'schools' });
export default School;

