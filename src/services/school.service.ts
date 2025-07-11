import bcrypt from 'bcrypt';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import School, {
	SchoolAttributes,
	SchoolInstance,
} from '../models/school.model';
import User, { UserInstance } from '../models/user.model';
import sequelize from '../config/db';

import { AppError } from '../utils/error.util';
import { SchoolRegistrationData } from '../types/models.types';

const DEFAULT_COUNTRY: CountryCode = 'NG';

export const createSchool = async (
	schoolData: SchoolRegistrationData
): Promise<{ school: SchoolInstance; admin: UserInstance }> => {
	const {
		name,
		school_image,
		phone_number,
		school_code,
		admin_username,
		admin_password,
		admin_email,
		admin_first_name,
		admin_last_name,
	} = schoolData;

	let formatted_phone_number: string | undefined;
	if (phone_number) {
		try {
			let parsedPhone;
			if (phone_number.startsWith('0') && phone_number.length === 11) {
				const localNumber = phone_number.slice(1);
				parsedPhone = parsePhoneNumber(
					`+234${localNumber}`,
					DEFAULT_COUNTRY
				);
			} else if (phone_number.startsWith('+')) {
				parsedPhone = parsePhoneNumber(phone_number);
			} else {
				parsedPhone = parsePhoneNumber(
					`+234${phone_number}`,
					DEFAULT_COUNTRY
				);
			}

			if (!parsedPhone || !parsedPhone.isValid())
				throw new AppError('Invalid phone number', 400);
			formatted_phone_number = parsedPhone.format('E.164');
		} catch (error) {
			throw new AppError('Invalid phone number format', 400);
		}
	}

	const existingSchool = await School.findOne({ where: { name } });
	if (existingSchool)
		throw new AppError('School with this name already exists', 400);

	if (school_code) {
		const existingCode = await School.findOne({ where: { school_code } });
		if (existingCode) throw new AppError('School code already exists', 400);
	}

	const existingUser = await User.findOne({
		where: { username: admin_username },
	});
	if (existingUser) throw new AppError('Admin username already exists', 400);

	const existingEmail = await User.findOne({ where: { email: admin_email } });
	if (existingEmail) throw new AppError('Admin email already exists', 400);

	return await sequelize.transaction(async (t) => {
		const school = (await School.create(
			{
				name,
				school_image,
				phone_number: formatted_phone_number,
				school_code,
			},
			{ transaction: t }
		)) as SchoolInstance;

		const password_hash = await bcrypt.hash(admin_password, 10);
		const admin = (await User.create(
			{
				username: admin_username,
				password_hash,
				email: admin_email,
				role: 'Admin',
				school_id: school.school_id!,
				first_name: admin_first_name,
				last_name: admin_last_name,
				is_approved: false,
			},
			{ transaction: t }
		)) as UserInstance;

		return { school, admin };
	});
};

export const getSchoolByCode = async (
	school_code: string
): Promise<SchoolInstance> => {
	if (!school_code) throw new AppError('School code is required', 400);
	const school = await School.findOne({ where: { school_code } });
	if (!school) throw new AppError('School not found', 404);
	return school as SchoolInstance;
};

export const getSchoolById = async (
	school_id: string
): Promise<SchoolInstance> => {
	const school = await School.findByPk(school_id);
	if (!school) throw new AppError('School not found', 404);
	return school as SchoolInstance;
};

// export const updateSchool = async (
//   school_id: string,
//   updates: Partial<SchoolAttributes>
// ): Promise<SchoolInstance> => {
//   const school = await School.findByPk(school_id);
//   if (!school) throw new AppError("School not found", 404);

//   if (updates.name && updates.name !== school.name) {
//     const existingSchool = await School.findOne({
//       where: { name: updates.name },
//     });
//     if (existingSchool)
//       throw new AppError("School with this name already exists", 400);
//   }

//   if (updates.school_code) {
//     const existingCode = await School.findOne({
//       where: { school_code: updates.school_code },
//     });
//     if (existingCode && existingCode.school_id !== school_id) {
//       throw new AppError("School code already exists", 400);
//     }
//   }

//   await school.update(updates);
//   return school as SchoolInstance;
// };

export const updateSchool = async (
	school_id: string,
	updates: Partial<SchoolAttributes>
): Promise<SchoolInstance> => {
	const school = await School.findByPk(school_id);
	if (!school) throw new AppError('School not found', 404);

	if (updates.name && updates.name !== school.name) {
		const existingSchool = await School.findOne({
			where: { name: updates.name },
		});
		if (existingSchool)
			throw new AppError('School with this name already exists', 400);
	}

	if (updates.school_code) {
		// Check if school_code is taken by another school
		const existingCode = await School.findOne({
			where: { school_code: updates.school_code },
		});

		if (existingCode && existingCode.school_id !== school_id) {
			throw new AppError('School code already in use', 400);
		}

		// Approve the school if providing a valid, unique school_code
		updates.is_active = true;
	}

	await school.update(updates);
	return school as SchoolInstance;
};
