import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import School from './school.model';
import Session from './session.model';

interface TermAttributes {
	term_id: string;
	school_id: string;
	session_id: string;
	name: string;
	start_date: Date;
	end_date: Date;
	is_active: boolean;
	created_at?: Date;
	updated_at?: Date;
}

interface TermCreationAttributes
	extends Optional<TermAttributes, 'term_id' | 'created_at' | 'updated_at'> {}

interface TermInstance
	extends Model<TermAttributes, TermCreationAttributes>,
		TermAttributes {}

const Term = sequelize.define<TermInstance>(
	'Term',
	{
		term_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		school_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: 'schools', key: 'school_id' },
		},
		session_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: 'sessions', key: 'session_id' },
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		start_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		end_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		tableName: 'terms',
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ['session_id', 'name'],
			},
		],
	}
);

// Define relationships

export default Term;
export { TermAttributes, TermInstance };
