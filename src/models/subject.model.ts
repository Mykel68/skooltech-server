import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import Class from './class.model';
import User from './user.model';
import Session from './session.model';
import Term from './term.model';

interface SubjectAttributes {
	subject_id?: string;
	school_id: string;
	class_id: string;
	teacher_id: string;
	term_id: string;
	session_id: string;
	name: string;
	short?: string;
	is_approved?: boolean;
}

interface SubjectInstance extends Model<SubjectAttributes>, SubjectAttributes {}

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

// Associations

export default Subject;
export { SubjectAttributes, SubjectInstance };
