import { v4 as uuidv4 } from "uuid";
import ParentLinkCode from "../models/student_link_code";

export const generateParentLinkCode = async ({
  student_user_id,
}: {
  student_user_id: string;
}): Promise<string> => {
  // Create unique code
  const code = uuidv4();

  // Optionally set expiration (e.g., 24 hours)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await ParentLinkCode.create({
    code,
    student_user_id,
    expires_at: expiresAt,
  });

  return code;
};
