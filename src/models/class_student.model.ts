// models/class_student.model.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { UserInstance } from './user.model';
import { StudentScoreInstance } from './student_score.model';
import { ClassInstance } from './class.model';

export interface ClassStudentAttributes {
	class_id: string;
	student_id: string;
	session_id: string;
	term_id: string;
	created_at?: Date;
}

export interface ClassStudentInstance
	extends Model<ClassStudentAttributes>,
		ClassStudentAttributes {
	student?: UserInstance;
	StudentScores?: StudentScoreInstance[];

	// Add this line to fix the TS error:
	Class?: ClassInstance;
}

const ClassStudent = sequelize.define<ClassStudentInstance>(
	'ClassStudent',
	{
		class_id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
			references: { model: 'classes', key: 'class_id' },
		},
		student_id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
			references: { model: 'users', key: 'user_id' },
		},
		session_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: 'sessions', key: 'session_id' },
		},
		term_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: 'terms', key: 'term_id' },
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: 'class_students',
		timestamps: true,
		underscored: true,
	}
);

export default ClassStudent;
