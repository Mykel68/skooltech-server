import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { ClassInstance } from "./class.model";
import { MessageRecipientInstance } from "./message_recipient";

export interface MessageAttributes {
  message_id?: string;
  school_id: string;
  admin_id: string;
  title: string;
  content: string;
  message_type: "announcement" | "message" | "urgent" | "newsletter";
  target_role: "Student" | "Teacher" | "Parent" | "All";
  class_id?: string | null;
  has_attachment: boolean;
  attachment_name?: string | null;
  status: "sent" | "delivered" | "read" | "draft";
  recipient_count: number;
  read_count: number;
  created_at?: Date;
  sent_at?: Date;
  recipients?: MessageRecipientInstance[];
}

type CreationAttributes = Optional<
  MessageAttributes,
  | "message_id"
  | "created_at"
  | "sent_at"
  | "recipient_count"
  | "read_count"
  | "has_attachment"
  | "attachment_name"
>;

export interface MessageInstance
  extends Model<MessageAttributes, CreationAttributes>,
    MessageAttributes {
  class?: ClassInstance;
  // recipients?: MessageRecipientInstance[];
}

const Message = sequelize.define<MessageInstance>(
  "Message",
  {
    message_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM("announcement", "message", "urgent", "newsletter"),
      allowNull: false,
    },
    target_role: {
      type: DataTypes.ENUM("Student", "Teacher", "Parent", "All"),
      allowNull: false,
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    has_attachment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    attachment_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "draft",
    },
    recipient_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    read_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "messages",
    underscored: true,
    timestamps: true,
  }
);

export default Message;
