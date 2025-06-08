import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

interface OtpAttributes {
	id: number;
	user_id: string;
	otp: string;
	expires_at: Date;
}

// For creation, id is optional since it's auto-incremented
interface OtpCreationAttributes extends Optional<OtpAttributes, 'id'> {}

export type OtpInstance = Model<OtpAttributes, OtpCreationAttributes> &
	OtpAttributes;

// Define the model with typings for instance and creation attributes
const Otp = sequelize.define<Model<OtpAttributes, OtpCreationAttributes>>(
	'Otp',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		otp: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		expires_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: 'otps',
		timestamps: true,
	}
);

// Association
Otp.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Otp;
