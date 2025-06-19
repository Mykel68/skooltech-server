import { Op } from 'sequelize';
import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';
import Session, { SessionInstance } from '../models/session.model';
import School from '../models/school.model';
import Term from '../models/term.model';
import ClassStudent from '../models/class_student.model';
import Subject from '../models/subject.model';

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
): Promise<
	{
		session_id: string;
		name: string;
		start_date: Date;
		end_date: Date;
		is_active: boolean;
		terms_count: number;
		students_count: number;
		terms: {
			term_id: string;
			name: string;
			start_date: Date;
			end_date: Date;
			is_active: boolean;
		}[];
	}[]
> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const sessions = await Session.findAll({
		where: { school_id },
		order: [
			['is_active', 'DESC'],
			['start_date', 'DESC'],
		],
	});

	const results = await Promise.all(
		sessions.map(async (session) => {
			const session_id = session.session_id!;

			// Fetch terms with relevant info
			const terms = await Term.findAll({
				where: { session_id },
				attributes: [
					'term_id',
					'name',
					'start_date',
					'end_date',
					'is_active',
				],
				order: [['start_date', 'ASC']],
			});

			const terms_count = terms.length;

			const students_count = await ClassStudent.count({
				where: { session_id },
				distinct: true,
				col: 'student_id',
			});

			return {
				session_id,
				name: session.name,
				start_date: session.start_date,
				end_date: session.end_date,
				is_active: session.is_active!,
				terms_count,
				students_count,
				terms: terms.map((term) => ({
					term_id: term.term_id!,
					name: term.name,
					start_date: term.start_date,
					end_date: term.end_date,
					is_active: term.is_active!,
				})),
			};
		})
	);

	return results;
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

export const getUserSessionsAndTerms = async (
	user_id: string,
	role: string,
	school_id: string
) => {
	if (role === 'Student') {
		const records = await ClassStudent.findAll({
			where: { student_id: user_id },
			attributes: ['session_id', 'term_id'],
			include: [
				{
					model: Session,
					where: { school_id },
					attributes: [],
				},
			],
			raw: true,
		});

		if (!records.length) return [];

		const sessionMap: Record<string, Set<string>> = {};
		for (const { session_id, term_id } of records) {
			if (!sessionMap[session_id]) sessionMap[session_id] = new Set();
			sessionMap[session_id].add(term_id);
		}

		const sessions = await Session.findAll({
			where: {
				session_id: Object.keys(sessionMap),
				school_id,
			},
			raw: true,
		});

		const terms = await Term.findAll({
			where: {
				term_id: {
					[Op.in]: [...new Set(records.map((r) => r.term_id))],
				},
			},
			raw: true,
		});

		return sessions.map((session) => ({
			session_id: session.session_id,
			session_name: session.name,
			terms: terms
				.filter((term) =>
					sessionMap[session.session_id!].has(term.term_id)
				)
				.map((term) => ({
					term_id: term.term_id,
					name: term.name,
				})),
		}));
	}

	if (role === 'Teacher') {
		const subjects = await Subject.findAll({
			where: {
				teacher_id: user_id,
				school_id,
			},
			attributes: ['session_id', 'term_id'],
			raw: true,
		});

		if (!subjects.length) {
			const session = await Session.findOne({
				where: { is_active: true, school_id },
				raw: true,
			});

			const term = await Term.findOne({
				where: { is_active: true, school_id },
				raw: true,
			});

			if (!session || !term) return [];

			return [
				{
					session_id: session.session_id,
					session_name: session.name,
					terms: [{ term_id: term.term_id, name: term.name }],
				},
			];
		}

		const sessionMap: Record<string, Set<string>> = {};
		for (const { session_id, term_id } of subjects) {
			if (!sessionMap[session_id]) sessionMap[session_id] = new Set();
			sessionMap[session_id].add(term_id);
		}

		const sessions = await Session.findAll({
			where: {
				session_id: Object.keys(sessionMap),
				school_id,
			},
			raw: true,
		});

		const terms = await Term.findAll({
			where: {
				term_id: {
					[Op.in]: [...new Set(subjects.map((s) => s.term_id))],
				},
			},
			raw: true,
		});

		return sessions.map((session) => ({
			session_id: session.session_id,
			session_name: session.name,
			terms: terms
				.filter((term) =>
					sessionMap[session.session_id!].has(term.term_id)
				)
				.map((term) => ({
					term_id: term.term_id,
					name: term.name,
				})),
		}));
	}

	throw new AppError(
		'Only students or teachers can access session-terms',
		403
	);
};
