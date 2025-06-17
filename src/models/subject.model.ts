import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import Class from './class.model';
import User from './user.model';
import { SubjectInstance } from '../types/models.types';
import { Term } from './term.model';
import Session from './session.model';

const Subject = sequelize.define<SubjectInstance>(
	'Subject',
	{
		subject_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		school_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: School, key: 'school_id' },
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
		term_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: Term, key: 'term_id' },
		},
		session_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: Session, key: 'session_id' },
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		short: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		is_approved: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		tableName: 'subjects',
		timestamps: true,
		underscored: true,
	}
);

Subject.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(Subject, { foreignKey: 'school_id' });
Subject.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Subject.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
Subject.belongsTo(Term, { foreignKey: 'term_id', as: 'term' });
Class.hasMany(Subject, { foreignKey: 'class_id', as: 'subjects' });
Subject.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
User.hasMany(Subject, { foreignKey: 'teacher_id', as: 'subjects' });

Class.hasMany(Subject, { as: 'subjects', foreignKey: 'class_id' });
export default Subject;
