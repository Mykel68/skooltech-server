// models/attendance.model.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

interface AttendanceAttributes {
	attendance_id?: string;
	student_id: string;
	class_id: string;
	session_id: string;
	term_id: string;
	school_id: string;
	days_present: number;
}

export interface AttendanceInstance
	extends Model<AttendanceAttributes>,
		AttendanceAttributes {}

const Attendance = sequelize.define<AttendanceInstance>(
	'Attendance',
	{
		attendance_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		student_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		class_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		session_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		term_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		school_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		days_present: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		tableName: 'attendances',
		timestamps: false,
		underscored: true,
	}
);

export default Attendance;
