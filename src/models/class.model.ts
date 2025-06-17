import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import { ClassInstance } from '../types/models.types';
import ClassStudent from './class_student.model';
import User from './user.model';
import Subject from './subject.model';
import ClassTeacher from './class_teacher.model';

const Class = sequelize.define<ClassInstance>(
	'Class',
	{
		class_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		school_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: School, key: 'school_id' },
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		short: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		grade_level: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: 'classes',
		timestamps: true,
		underscored: true,
	}
);

Class.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(Class, { foreignKey: 'school_id' });
Class.hasMany(ClassStudent, {
	as: 'class_students',
	foreignKey: 'class_id',
});

Class.belongsTo(User, {
	as: 'class_teacher',
	foreignKey: 'teacher_id',
});

Class.hasMany(Subject, {
	as: 'subjects',
	foreignKey: 'class_id',
});

Class.hasMany(ClassTeacher, { foreignKey: 'class_id', as: 'class_teachers' });

export default Class;
