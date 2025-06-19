import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { SubjectInstance } from './subject.model';
import { ClassTeacherInstance } from './class_teacher.model';
import { ClassStudentInstance } from './class_student.model';
import { UserInstance } from './user.model';

/**
 * Class attributes
 */
interface ClassAttributes {
	class_id?: string;
	school_id: string;
	name: string;
	short: string;
	grade_level: string;
	created_at?: string;
}

/**
 * ClassInstance type declaration
 */
interface ClassInstance extends Model<ClassAttributes>, ClassAttributes {
	Class?: ClassInstance;
	class_students?: ClassStudentInstance[];
	subjects?: SubjectInstance[];
	class_teachers?: ClassTeacherInstance[];
	student?: UserInstance;
}

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

export default Class;
export { ClassInstance };
