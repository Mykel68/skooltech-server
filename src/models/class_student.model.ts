import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import Class from './class.model';
import User from './user.model';
import { ClassStudentInstance } from '../types/models.types';
import { Term } from './term.model';
import Session from './session.model';

const ClassStudent = sequelize.define<ClassStudentInstance>(
	'ClassStudent',
	{
		class_id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
			references: { model: 'classes', key: 'class_id' }, // <-- use string to avoid circular import
		},
		student_id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
			references: { model: 'users', key: 'user_id' }, // <-- use string
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

ClassStudent.belongsTo(Class, { foreignKey: 'class_id' });
Class.hasMany(ClassStudent, { foreignKey: 'class_id' });
ClassStudent.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
User.hasMany(ClassStudent, { foreignKey: 'student_id', as: 'class_students' });
ClassStudent.belongsTo(Session, { foreignKey: 'session_id' });
ClassStudent.belongsTo(Term, { foreignKey: 'term_id' });

export default ClassStudent;
