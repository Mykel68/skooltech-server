import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import { TermInstance } from './term.model';

interface SessionAttributes {
	session_id?: string;
	school_id: string;
	name: string;
	is_active?: boolean;
	start_date: Date;
	end_date: Date;
}

interface SessionInstance extends Model<SessionAttributes>, SessionAttributes {
	terms: TermInstance[];
}

const Session = sequelize.define<SessionInstance>(
	'Session',
	{
		session_id: {
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
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		start_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		end_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: 'sessions',
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ['school_id', 'name'],
			},
		],
	}
);

export default Session;
export { SessionAttributes, SessionInstance };
