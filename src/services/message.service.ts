import { Op } from "sequelize";
import {
  Class,
  ClassStudent,
  Message,
  MessageRecipient,
  ParentStudent,
  Subject,
  User,
} from "../models";
import { v4 as uuidv4 } from "uuid";

interface CreateMessagePayload {
  school_id: string;
  admin_id: string;
  title: string;
  content: string;
  message_type: "announcement" | "message" | "urgent" | "newsletter";
  target_role: "Student" | "Teacher" | "Parent" | "All";
  class_id?: string;
  has_attachment?: boolean;
  attachment_name?: string;
}

export const createMessage = async (payload: CreateMessagePayload) => {
  let roleFilter: string[] = [];

  if (payload.target_role === "All") {
    roleFilter = ["Student", "Teacher", "Parent"];
  } else {
    roleFilter = [payload.target_role];
  }

  let recipients;

  if (payload.target_role === "Student" && payload.class_id) {
    // Students in class
    recipients = await User.findAll({
      include: [
        {
          model: ClassStudent,
          as: "class_students",
          required: true,
          where: { class_id: payload.class_id },
        },
      ],
      where: {
        school_id: payload.school_id,
        role: "Student",
      },
      attributes: ["user_id"],
    });
  } else if (payload.target_role === "Teacher" && payload.class_id) {
    // Teachers teaching subjects in class
    recipients = await User.findAll({
      include: [
        {
          model: Subject,
          as: "subjects",
          required: true,
          where: { class_id: payload.class_id },
        },
      ],
      where: {
        school_id: payload.school_id,
        role: "Teacher",
      },
      attributes: ["user_id"],
    });
  } else if (payload.target_role === "Parent" && payload.class_id) {
    // Parents whose children are in class
    recipients = await User.findAll({
      include: [
        {
          model: User,
          as: "children",
          required: true,
          include: [
            {
              model: ClassStudent,
              as: "class_students",
              required: true,
              where: { class_id: payload.class_id },
            },
          ],
        },
      ],
      where: {
        school_id: payload.school_id,
        role: "Parent",
      },
      attributes: ["user_id"],
    });
  } else {
    // No class filter
    recipients = await User.findAll({
      where: {
        school_id: payload.school_id,
        role: { [Op.in]: roleFilter },
      },
      attributes: ["user_id"],
    });
  }

  if (!recipients.length) {
    throw new Error("No recipients found for the specified criteria.");
  }

  // 2. Create the message
  const message = await Message.create({
    school_id: payload.school_id,
    admin_id: payload.admin_id,
    title: payload.title,
    content: payload.content,
    message_type: payload.message_type,
    target_role: payload.target_role,
    class_id: payload.class_id,
    has_attachment: payload.has_attachment,
    attachment_name: payload.attachment_name,
    status: "sent",
    recipient_count: recipients.length,
    read_count: 0,
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

// Get only messages for this user
export const getMessagesForUser = async (user_id: string) => {
  return await Message.findAll({
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
};

// Get *all* messages sent in a school
export const getSchoolMessages = async (
  school_id: string,
  admin_id: string
) => {
  const messages = await Message.findAll({
    where: { school_id, admin_id },
    order: [["sent_at", "DESC"]],
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["class_id", "grade_level", "name"],
      },
    ],
  });

  return messages.map((msg) => {
    let target_description;

    if (!msg.class_id) {
      target_description = `All ${msg.target_role}s`;
    } else if (msg.class) {
      target_description = `${msg.class.grade_level} ${msg.target_role}s`;
    } else {
      target_description = `${msg.target_role}s`;
    }

    return {
      ...msg.toJSON(),
      target_description,
    };
  });
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
