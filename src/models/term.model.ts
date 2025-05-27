import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import { TermInstance } from '../types/models.types';

// Define Term model
interface TermAttributes {
	term_id: string;
	school_id: string;
	session_id: string;
	name: string;
	start_date: Date;
	end_date: Date;
	created_at: Date;
	updated_at: Date;
}

interface TermCreationAttributes
	extends Optional<TermAttributes, 'term_id' | 'created_at' | 'updated_at'> {}

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

// Import other models
import School from './school.model';
import Session from './session.model';

// Define relationships
School.hasMany(Session, { foreignKey: 'school_id', as: 'sessions' });
Session.belongsTo(School, { foreignKey: 'school_id', as: 'school' });

School.hasMany(Term, { foreignKey: 'school_id', as: 'terms' });
Term.belongsTo(School, { foreignKey: 'school_id', as: 'school' });

Session.hasMany(Term, { foreignKey: 'session_id', as: 'terms' });
Term.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

// Export models
export { School, Session, Term };
