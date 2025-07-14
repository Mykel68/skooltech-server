import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

export interface MessageRecipientAttributes {
  id: string;
  message_id: string;
  user_id: string;
  delivered_at?: Date;
  read_at?: Date | null;
}

type CreationAttributes = Optional<
  MessageRecipientAttributes,
  "id" | "delivered_at" | "read_at"
>;

export interface MessageRecipientInstance
  extends Model<MessageRecipientAttributes, CreationAttributes>,
    MessageRecipientAttributes {}

const MessageRecipient = sequelize.define<MessageRecipientInstance>(
  "MessageRecipient",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    message_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    delivered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "message_recipients",
    underscored: true,
    timestamps: false,
  }
);

export default MessageRecipient;
