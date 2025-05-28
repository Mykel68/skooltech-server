import { Op } from 'sequelize';
import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';
import Session from '../models/session.model';
import School from '../models/school.model';
import { SessionInstance } from '../types/models.types';

export const createSession = async (
	school_id: string,
	name: string,
	start_date: Date,
	end_date: Date,
	is_active: boolean = false
): Promise<SessionInstance> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!name) throw new AppError('Session name is required', 400);

	if (
		!start_date ||
		!end_date ||
		isNaN(start_date.getTime()) ||
		isNaN(end_date.getTime())
	) {
		throw new AppError('Valid start and end dates are required', 400);
	}
	if (end_date <= start_date)
		throw new AppError('End date must be after start date', 400);

	const school = await School.findByPk(school_id);
	if (!school) throw new AppError('School not found', 404);

	const existingSession = await Session.findOne({
		where: { school_id, name },
	});
	if (existingSession)
		throw new AppError('Session name already exists for this school', 400);

	// Check if there's an already active session for this school
	const hasActiveSession = await Session.findOne({
		where: { school_id, is_active: true },
	});

	// If there's already an active session, set is_active to false
	const session = await Session.create({
		school_id,
		name,
		start_date,
		end_date,
		is_active: !hasActiveSession, // only true if no active session exists
	});

	return session;
};

export const editSession = async (
	school_id: string,
	session_id: string,
	updates: {
		name?: string;
		start_date?: Date;
		end_date?: Date;
		is_active?: boolean;
	}
): Promise<SessionInstance> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(session_id))
		throw new AppError('Invalid session ID', 400);
	if (!Object.keys(updates).length)
		throw new AppError('At least one field must be provided', 400);

	const school = await School.findByPk(school_id);
	if (!school) throw new AppError('School not found', 404);

	const session = await Session.findByPk(session_id);
	if (!session) throw new AppError('Session not found', 404);
	if (session.school_id !== school_id)
		throw new AppError('Session does not belong to this school', 403);

	const { name, start_date, end_date, is_active } = updates;

	// Validate provided fields
	if (name !== undefined && name === '')
		throw new AppError('Session name cannot be empty', 400);
	if (name) {
		const existingSession = await Session.findOne({
			where: {
				school_id,
				name,
				session_id: { [Op.ne]: session_id },
			},
		});
		if (existingSession)
			throw new AppError(
				'Session name already exists for this school',
				400
			);
	}

	if (start_date && isNaN(start_date.getTime()))
		throw new AppError('Invalid start date', 400);
	if (end_date && isNaN(end_date.getTime()))
		throw new AppError('Invalid end date', 400);

	// Validate date consistency
	const effectiveStartDate = start_date || session.start_date;
	const effectiveEndDate = end_date || session.end_date;
	if ((start_date || end_date) && effectiveEndDate <= effectiveStartDate)
		throw new AppError('End date must be after start date', 400);

	// If setting is_active to true (and it wasn't true before), deactivate other sessions
	if (is_active === true && !session.is_active) {
		await Session.update(
			{ is_active: false },
			{
				where: {
					school_id,
					is_active: true,
					session_id: { [Op.ne]: session_id },
				},
			}
		);
	}

	// Prepare update object with only provided fields
	// const updateData: Partial<SessionInstance> = {
	//   updated_at: new Date(),
	// };
	// if (name !== undefined) updateData.name = name;
	// if (start_date) updateData.start_date = start_date;
	// if (end_date) updateData.end_date = end_date;
	// if (is_active !== undefined) updateData.is_active = is_active;

	// Update session
	// await session.update(updateData);

	// Update session
	await session.update(updates);

	return session;
};

export const getSessions = async (
	school_id: string
): Promise<SessionInstance[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const sessions = await Session.findAll({
		where: { school_id },
		order: [
			['is_active', 'DESC'], // Active sessions first
			['start_date', 'DESC'], // Then by start_date descending
		],
	});
	return sessions;
};

export const getSessionById = async (
	session_id: string,
	school_id: string
): Promise<SessionInstance> => {
	if (!validateUUID(session_id))
		throw new AppError('Invalid session ID', 400);
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const session = await Session.findByPk(session_id, {
		include: [
			{
				model: School,
				as: 'school',
				attributes: ['name', 'address', 'school_image', 'phone_number'],
			},
		],
	});

	if (!session) throw new AppError('Session not found', 404);

	return session;
};

export const getSchoolSessions = async (school_id: string): Promise<any> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	const sessions = await Session.findAll({
		where: { school_id },
		order: [
			['is_active', 'DESC'], // Active sessions first
			['start_date', 'DESC'], // Then by start_date descending
		],
	});
	return sessions;
};
