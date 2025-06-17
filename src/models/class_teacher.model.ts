// models/class_teacher.model.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { SubjectInstance, UserInstance } from '../types/models.types';

interface ClassTeacherAttributes {
	class_teacher_id?: string;
	class_id: string;
	teacher_id: string;
	session_id: string;
	school_id: string;
	term_id: string;
}

interface ClassTeacherInstance
	extends Model<ClassTeacherAttributes>,
		ClassTeacherAttributes {
	teacher?: UserInstance;
	subject?: SubjectInstance;
}

const ClassTeacher = sequelize.define<ClassTeacherInstance>(
	'ClassTeacher',
	{
		class_teacher_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		school_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: 'schools', key: 'school_id' },
		},
		class_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: 'classes', key: 'class_id' },
		},
		teacher_id: {
			type: DataTypes.UUID,
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
	},
	{
		tableName: 'class_teachers',
		timestamps: false,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ['class_id', 'session_id', 'term_id'],
			},
		],
	}
);

export default ClassTeacher;
export { ClassTeacherInstance };
