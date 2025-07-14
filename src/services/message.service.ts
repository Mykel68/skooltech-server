import { Op } from "sequelize";
import { Message, MessageRecipient, User } from "../models";
import { v4 as uuidv4 } from "uuid";

interface CreateMessagePayload {
  school_id: string;
  admin_id: string;
  title: string;
  content: string;
  message_type: "announcement" | "message" | "urgent" | "newsletter";
  target_role: "student" | "teacher" | "parent" | "all";
  class_id?: string;
  has_attachment?: boolean;
  attachment_name?: string;
}

export const createMessage = async (payload: CreateMessagePayload) => {
  // 1. Find recipients in this school
  let roleFilter: string[] = [];

  if (payload.target_role === "all") {
    roleFilter = ["student", "teacher", "parent"];
  } else {
    roleFilter = [payload.target_role];
  }

  const whereClause: any = {
    school_id: payload.school_id,
    role: { [Op.in]: roleFilter },
  };

  if (payload.class_id) {
    whereClause.class_id = payload.class_id;
  }

  const recipients = await User.findAll({
    where: whereClause,
    attributes: ["user_id"],
  });

  if (!recipients.length) {
    throw new Error("No recipients found for the specified criteria.");
  }

  // 2. Create the message
  const message = await Message.create({
    ...payload,
    recipient_count: recipients.length,
    status: "sent",
    sent_at: new Date(),
  });

  // 3. Insert MessageRecipient records
  const recipientEntries = recipients.map((user) => ({
    id: uuidv4(),
    message_id: message.message_id!,
    user_id: user.user_id,
    delivered_at: new Date(),
    read_at: null,
  }));

  await MessageRecipient.bulkCreate(recipientEntries);

  return message;
};

export const getMessagesForUser = async (user_id: string) => {
  const messages = await Message.findAll({
    include: [
      {
        model: MessageRecipient,
        as: "recipients",
        where: { user_id },
        required: true,
      },
    ],
    order: [["sent_at", "DESC"]],
  });

  return messages;
};

export const getMessageById = async (id: string, user_id: string) => {
  const message = await Message.findOne({
    where: { message_id: id },
    include: [
      {
        model: MessageRecipient,
        as: "recipients",
        where: { user_id },
        required: true,
      },
    ],
  });

  if (!message) {
    throw new Error("Message not found or not accessible to this user.");
  }

  return message;
};

export const markMessageAsRead = async (
  message_id: string,
  user_id: string
) => {
  const recipient = await MessageRecipient.findOne({
    where: { message_id, user_id },
  });

  if (!recipient) {
    throw new Error("Recipient entry not found.");
  }

  if (!recipient.read_at) {
    recipient.read_at = new Date();
    await recipient.save();

    // Increment read count on Message
    await Message.increment("read_count", {
      where: { message_id },
    });
  }

  return recipient;
};

export const deleteMessage = async (message_id: string, user_id: string) => {
  const recipient = await MessageRecipient.findOne({
    where: { message_id, user_id },
  });

  if (!recipient) {
    throw new Error("Recipient entry not found.");
  }
  await recipient.destroy();

  // Decrement read count on Message
  await Message.decrement("read_count", {
    where: { message_id },
  });

  return recipient;
};
