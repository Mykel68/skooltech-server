import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Class from './class.model';
import User from './user.model';
import { SubjectInstance, UserInstance } from '../types/models.types';
import Session from './session.model';
import { Term } from './term.model';
import ClassStudent from './class_student.model';

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
			references: { model: Class, key: 'class_id' },
		},
		teacher_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: User, key: 'user_id' },
		},
		session_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: Session, key: 'session_id' },
		},
		term_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: Term, key: 'term_id' },
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

ClassTeacher.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
ClassTeacher.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
Class.hasMany(ClassTeacher, { foreignKey: 'class_id', as: 'class_teachers' });
User.hasMany(ClassTeacher, { foreignKey: 'teacher_id', as: 'class_teachers' });
ClassTeacher.belongsTo(Session, { as: 'session', foreignKey: 'session_id' });
ClassTeacher.belongsTo(Term, { as: 'term', foreignKey: 'term_id' });

export default ClassTeacher;
export { ClassTeacherInstance };
