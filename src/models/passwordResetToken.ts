import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/db';
import User from './user.model';

export interface PasswordTokenAttributes {
	id?: string;
	user_id: string;
	token: string;
	expires_at: Date;
}

export class PasswordToken
	extends Model<PasswordTokenAttributes>
	implements PasswordTokenAttributes
{
	public id!: string;
	public user_id!: string;
	public token!: string;
	public expires_at!: Date;
}

PasswordToken.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: () => uuidv4(),
			primaryKey: true,
		},
		user_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: User, key: 'user_id' },
		},
		token: {
			type: DataTypes.UUID,
			defaultValue: () => uuidv4(),
			allowNull: false,
			unique: true,
		},
		expires_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: 'password_tokens',
		underscored: true,
		timestamps: true,
	}
);

// Optional association
PasswordToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
export default PasswordToken;
