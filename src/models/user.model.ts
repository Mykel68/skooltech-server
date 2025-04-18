import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import { UserInstance } from '../types/models.types';

const User = sequelize.define<UserInstance>('User', {
  user_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  school_id: { type: DataTypes.UUID, allowNull: false },
  role: { type: DataTypes.ENUM('Admin', 'Teacher', 'Student', 'Parent'), allowNull: false },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
  is_approved: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true
  },
}, { 
  tableName: 'users',
  hooks: {
    beforeCreate: (user: UserInstance) => {
      user.is_approved = user.role === 'Teacher' ? false : true;
    },
  },
});

User.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(User, { foreignKey: 'school_id' });

export default User;