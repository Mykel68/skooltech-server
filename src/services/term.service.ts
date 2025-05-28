import { Op } from 'sequelize';
import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';
import { Term } from '../models/term.model';
import Session from '../models/session.model';
import School from '../models/school.model';
import { TermInstance } from '../types/models.types';
import Assessment from '../models/assessment.model';

export const createTerm = async (
	school_id: string,
	session_id: string,
	name: string,
	start_date: Date,
	end_date: Date
): Promise<TermInstance> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(session_id))
		throw new AppError('Invalid session ID', 400);
	if (!name) throw new AppError('Term name is required', 400);
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

	const session = await Session.findByPk(session_id);
	if (!session) throw new AppError('Session not found', 404);
	if (session.school_id !== school_id)
		throw new AppError('Session does not belong to this school', 403);
	if (start_date < session.start_date || end_date > session.end_date) {
		throw new AppError('Term dates must be within session dates', 400);
	}

	const existingTerm = await Term.findOne({ where: { session_id, name } });
	if (existingTerm)
		throw new AppError('Term name already exists for this session', 400);

	const term = await Term.create({
		school_id,
		session_id,
		name,
		start_date,
		end_date,
	});
	return term;
};

export const updateTerm = async (
	term_id: string,
	updates: {
		name?: string;
		start_date?: Date;
		end_date?: Date;
	}
): Promise<TermInstance> => {
	if (!validateUUID(term_id)) throw new AppError('Invalid term ID', 400);
	if (!Object.keys(updates).length)
		throw new AppError('At least one field must be provided', 400);

	const term = await Term.findByPk(term_id);
	if (!term) throw new AppError('Term not found', 404);

	const session = await Session.findByPk(term.session_id);
	if (!session) throw new AppError('Session not found', 404);

	const { name, start_date, end_date } = updates;

	// Validate provided fields
	if (name !== undefined && name === '')
		throw new AppError('Term name cannot be empty', 400);
	if (name) {
		const existingTerm = await Term.findOne({
			where: {
				session_id: term.session_id,
				name,
				term_id: { [Op.ne]: term_id },
			},
		});
		if (existingTerm)
			throw new AppError(
				'Term name already exists for this session',
				400
			);
	}

	if (start_date && isNaN(start_date.getTime()))
		throw new AppError('Invalid start date', 400);
	if (end_date && isNaN(end_date.getTime()))
		throw new AppError('Invalid end date', 400);

	// Validate date consistency
	const effectiveStartDate = start_date || term.start_date;
	const effectiveEndDate = end_date || term.end_date;
	if ((start_date || end_date) && effectiveEndDate <= effectiveStartDate)
		throw new AppError('End date must be after start date', 400);

	// Validate session date boundaries
	if (
		(start_date && start_date < session.start_date) ||
		(end_date && end_date > session.end_date)
	)
		throw new AppError('Term dates must be within session dates', 400);

	// Prepare update object
	// const updateData: Partial<TermInstance> = {
	//   updated_at: new Date(),
	// };
	// if (name !== undefined) updateData.name = name;
	// if (start_date) updateData.start_date = start_date;
	// if (end_date) updateData.end_date = end_date;

	await term.update(updates);
	return term;
};

export const deleteTerm = async (term_id: string): Promise<void> => {
	if (!validateUUID(term_id)) throw new AppError('Invalid term ID', 400);

	const term = await Term.findByPk(term_id);
	if (!term) throw new AppError('Term not found', 404);

	const assessments = await Assessment.findAll({ where: { term_id } });
	if (assessments.length > 0)
		throw new AppError(
			'Cannot delete term with associated assessments',
			400
		);

	await term.destroy();
};

export const getTerms = async (
	session_id: string,
	school_id: string
): Promise<TermInstance[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	let targetSessionId = session_id;
	if (!session_id) {
		const currentDate = new Date();
		const session = await Session.findOne({
			where: {
				school_id,
				start_date: { [Op.lte]: currentDate },
				end_date: { [Op.gte]: currentDate },
			},
		});
		if (!session)
			throw new AppError('No active session found for this school', 400);
		targetSessionId = session.session_id;
	} else if (!validateUUID(session_id)) {
		throw new AppError('Invalid session ID', 400);
	}

	const session = await Session.findOne({
		where: { session_id: targetSessionId, school_id },
	});
	if (!session) throw new AppError('Session not found in this school', 404);

	const terms = await Term.findAll({
		where: { session_id: targetSessionId },
		order: [['start_date', 'ASC']],
	});
	return terms;
};

export const getSchoolSessions = async (school_id: string): Promise<any> => {
	if (!validateUUID(school_id)) {
		throw new AppError('Invalid school ID', 400);
	}

	const sessions = await Session.findAll({
		where: { school_id },
		attributes: [
			'session_id',
			'name',
			'is_active',
			'start_date',
			'end_date',
		],
		include: [
			{
				model: Term,
				as: 'terms',
				attributes: ['term_id', 'name', 'start_date', 'end_date'],
			},
		],
		order: [
			['start_date', 'ASC'],
			[{ model: Term, as: 'terms' }, 'start_date', 'ASC'],
		],
	});

	const data: Record<string, any> = {};

	for (const session of sessions) {
		data[session.session_id] = {
			name: session.name,
			is_active: session.is_active,
			start_date: session.start_date,
			end_date: session.end_date,
			terms:
				session.terms?.map((term) => ({
					term_id: term.term_id,
					name: term.name,
					start_date: term.start_date,
					end_date: term.end_date,
				})) || [],
		};
	}

	return { sessions: data };
};
