import bcrypt from "bcrypt";
import { parsePhoneNumber, CountryCode } from "libphonenumber-js";
import School from "../models/school.model";
import User from "../models/user.model";
import sequelize from "../config/db";
import {
  SchoolRegistrationData,
  SchoolInstance,
  UserInstance,
} from "../types/models.types";
import { AppError } from "../utils/error.util";

// Default country code for Nigeria
const DEFAULT_COUNTRY: CountryCode = "NG";

export const createSchool = async (
  schoolData: SchoolRegistrationData
): Promise<{ school: SchoolInstance; admin: UserInstance }> => {
  const {
    name,
    address,
    school_image,
    phone_number,
    admin_username,
    admin_password,
    admin_email,
    admin_first_name,
    admin_last_name,
  } = schoolData;

  // Validate and format phone number
  let formatted_phone_number: string | undefined;
  if (phone_number) {
    try {
      let parsedPhone;
      if (phone_number.startsWith("0") && phone_number.length === 11) {
        // Local Nigerian number with leading zero (e.g., 08012345678)
        const localNumber = phone_number.slice(1); // Remove leading 0
        parsedPhone = parsePhoneNumber(`+234${localNumber}`, DEFAULT_COUNTRY);
      } else if (phone_number.startsWith("+")) {
        // International number (e.g., +2348012345678, +12025550123)
        parsedPhone = parsePhoneNumber(phone_number);
      } else {
        // Assume local Nigerian number without leading 0 (e.g., 8012345678)
        parsedPhone = parsePhoneNumber(`+234${phone_number}`, DEFAULT_COUNTRY);
      }

      if (!parsedPhone || !parsedPhone.isValid())
        throw new AppError("Invalid phone number", 400);
      formatted_phone_number = parsedPhone.format("E.164"); // e.g., +2348012345678
    } catch (error) {
      throw new AppError("Invalid phone number format", 400);
    }
  }

  // Check for duplicates
  const existingSchool = await School.findOne({ where: { name } });
  if (existingSchool)
    throw new AppError("School with this name already exists", 400);

  const existingUser = await User.findOne({
    where: { username: admin_username },
  });
  if (existingUser) throw new AppError("Admin username already exists", 400);

  const existingEmail = await User.findOne({ where: { email: admin_email } });
  if (existingEmail) throw new AppError("Admin email already exists", 400);

  // Create school and admin in a transaction
  return await sequelize.transaction(async (t) => {
    const school = (await School.create(
      { name, address, school_image, phone_number: formatted_phone_number },
      { transaction: t }
    )) as SchoolInstance;

    const password_hash = await bcrypt.hash(admin_password, 10);
    const admin = (await User.create(
      {
        username: admin_username,
        password_hash,
        email: admin_email,
        role: "Admin",
        school_id: school.school_id!, // Non-null assertion
        first_name: admin_first_name,
        last_name: admin_last_name,
        is_approved: true,
      },
      { transaction: t }
    )) as UserInstance;

    return { school, admin };
  });
};
