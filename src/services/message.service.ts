import { Op } from "sequelize";
import {
  Class,
  ClassStudent,
  Message,
  MessageRecipient,
  Subject,
  User,
} from "../models";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utils/error.util";

// Define accepted roles
export type Role = "Teacher" | "Student" | "Parent" | "All";

// Map role names to their numeric IDs in DB
const ROLE_IDS = {
  Teacher: 3,
  Student: 9,
  Parent: 10,
} as const;

interface CreateMessagePayload {
  school_id: string;
  admin_id: string;
  title: string;
  content: string;
  message_type: "announcement" | "message" | "urgent" | "newsletter";
  target_role: string; // plural/singular possible
  class_id?: string;
  has_attachment?: boolean;
  attachment_name?: string;
}

// Helper: strict role validator
const isValidRole = (role: string): role is Role => {
  return ["Teacher", "Student", "Parent", "All"].includes(role);
};

export const createMessage = async (payload: CreateMessagePayload) => {
  let normalizedRole: Role = "All";
  let roleIdFilter: number[] = [];

  // Normalize role (remove plural 's')
  const rawRole = payload.target_role.trim().replace(/s$/i, "");

  if (isValidRole(rawRole)) {
    normalizedRole = rawRole;
    roleIdFilter =
      normalizedRole === "All"
        ? [ROLE_IDS.Teacher, ROLE_IDS.Student, ROLE_IDS.Parent]
        : [ROLE_IDS[normalizedRole]];
  } else {
    throw new AppError(`Invalid target_role: ${payload.target_role}`, 400);
  }

  let recipients;

  // Student in a specific class
  if (normalizedRole === "Student" && payload.class_id) {
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
        role_id: ROLE_IDS.Student,
      },
      attributes: ["user_id"],
    });
  }
  // Teacher in a specific class
  else if (normalizedRole === "Teacher" && payload.class_id) {
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
        role_id: ROLE_IDS.Teacher,
      },
      attributes: ["user_id"],
    });
  }
  // Parent in a specific class
  else if (normalizedRole === "Parent" && payload.class_id) {
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
        role_id: ROLE_IDS.Parent,
      },
      attributes: ["user_id"],
    });
  }
  // All / Role without class filter
  else {
    recipients = await User.findAll({
      where: {
        school_id: payload.school_id,
        role_id: { [Op.in]: roleIdFilter },
      },
      attributes: ["user_id"],
    });
  }

  if (!recipients.length) {
    throw new AppError("No recipients found for the specified criteria.", 404);
  }

  // Create the message
  const message = await Message.create({
    school_id: payload.school_id,
    admin_id: payload.admin_id,
    title: payload.title,
    content: payload.content,
    message_type: payload.message_type,
    target_role: normalizedRole,
    class_id: payload.class_id,
    has_attachment: payload.has_attachment,
    attachment_name: payload.attachment_name,
    status: "sent",
    recipient_count: recipients.length,
    read_count: 0,
    sent_at: new Date(),
  });

  // Create message recipients
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
export const getMessagesForUser = async (
  school_id: string,
  user_id: string
) => {
  const messages = await Message.findAll({
    where: { school_id },
    include: [
      {
        model: MessageRecipient,
        as: "recipients",
        where: { user_id },
        required: true,
      },
      {
        model: Class,
        as: "class", // adjust this alias to match your association
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  const truncate = (text: string, length = 20) =>
    text && text.length > length ? text.slice(0, length) + "..." : text;

  const transformedMessages = messages.map((msg) => {
    const json = msg.toJSON();
    const recipient = json.recipients?.[0];
    const isRead = !!recipient?.read_at;

    return {
      message_id: json.message_id,
      title: json.title,
      grade_level: messages[0]?.class?.grade_level || "",
      message_type: json.message_type,
      target_role: json.target_role,
      content: isRead ? json.content || "" : truncate(json.content || ""),
      isRead,
      author: json.admin_id ? "School Admin" : "Unknown",
      created_at: json.created_at,
      sent_at: json.sent_at,
      hasAttachment: json.has_attachment,
      attachmentName: json.attachment_name,
    };
  });

  return transformedMessages;
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
  // 1. Find the recipient entry for this user
  const recipient = await MessageRecipient.findOne({
    where: { message_id, user_id },
  });

  if (!recipient) {
    throw new Error("Recipient entry not found.");
  }

  // 2. Only mark as read once
  if (!recipient.read_at) {
    recipient.read_at = new Date();
    await recipient.save();

    await Message.increment("read_count", {
      where: { message_id },
    });
  }

  // 3. Fetch the message itself
  const message = await Message.findOne({
    where: { message_id },
  });

  if (!message) {
    throw new Error("Message not found.");
  }

  // 4. Return all fields plus isRead: true
  return {
    ...message.toJSON(),
    isRead: true,
  };
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
  // await Message.decrement("read_count", {
  //   where: { message_id },
  // });

  return { success: true };
};

export const deleteAdminMessage = async (
  message_id: string,
  admin_id: string
) => {
  // Find the message
  const message = await Message.findOne({
    where: { message_id, admin_id },
  });

  if (!message) {
    throw new Error("Message not found or you are not the owner.");
  }

  // Delete all recipients
  await MessageRecipient.destroy({
    where: { message_id },
  });

  // Delete the message itself
  await message.destroy();

  return { success: true };
};
