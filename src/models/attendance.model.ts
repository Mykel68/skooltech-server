import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';
import Class from './class.model';
import Session from './session.model';
import { Term } from './term.model';

interface AttendanceAttributes {
	attendance_id?: string;
	student_id: string;
	class_id: string;
	session_id: string;
	term_id: string;
	days_present: number;
	school_id: string;
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

Attendance.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Attendance.belongsTo(Class, { foreignKey: 'class_id' });
Attendance.belongsTo(Session, { foreignKey: 'session_id' });
Attendance.belongsTo(Term, { foreignKey: 'term_id' });

export default Attendance;
