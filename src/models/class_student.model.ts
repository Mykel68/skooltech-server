import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import Class from './class.model';
import User from './user.model';
import { ClassStudentInstance } from '../types/models.types';

const ClassStudent = sequelize.define<ClassStudentInstance>(
	'ClassStudent',
	{
		class_id: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: { model: Class, key: 'class_id' },
		},
		student_id: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: { model: User, key: 'user_id' },
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

export default ClassStudent;
