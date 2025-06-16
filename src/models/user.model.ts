import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import { UserInstance } from '../types/models.types';

const User = sequelize.define<UserInstance>(
	'User',
	{
		user_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		school_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: School, key: 'school_id' },
		},
		role: {
			type: DataTypes.ENUM('Admin', 'Teacher', 'Student'),
			allowNull: false,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password_hash: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		first_name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		last_name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		gender: {
			type: DataTypes.ENUM('Male', 'Female'),
			allowNull: true,
			defaultValue: null,
		},
		is_approved: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		tableName: 'users',
		timestamps: true,
		underscored: true,
	}
);

User.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(User, { foreignKey: 'school_id' });

export default User;
