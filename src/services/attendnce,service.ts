import Attendance from '../models/attendance.model';
import { Term } from '../models/term.model';
import User from '../models/user.model';
import { AppError } from '../utils/error.util';
import { countWeekdays } from '../utils/getWeekdays';

export const recordAttendance = async (
	school_id: string,
	student_id: string,
	class_id: string,
	term_id: string,
	session_id: string,
	days_present: number
) => {
	// Check if term exists and fetch its duration
	const term = await Term.findOne({
		where: { term_id, session_id, school_id },
	});
	if (!term || !term.start_date || !term.end_date)
		throw new AppError('Term not properly set up', 404);

	// Upsert attendance record
	const [record, created] = await Attendance.upsert(
		{
			school_id,
			student_id,
			class_id,
			term_id,
			session_id,
			days_present,
		},
		{ returning: true }
	);

	return {
		...record.toJSON(),
		total_days: countWeekdays(
			new Date(term.start_date),
			new Date(term.end_date)
		),
	};
};

export const getAttendance = async (
	school_id: string,
	student_id: string,
	term_id: string,
	session_id: string
) => {
	const record = await Attendance.findOne({
		where: { school_id, student_id, term_id, session_id },
	});
	const term = await Term.findOne({
		where: { term_id, session_id, school_id },
	});

	if (!term || !term.start_date || !term.end_date)
		throw new AppError('Term not properly set up', 404);

	const total_days = countWeekdays(
		new Date(term.start_date),
		new Date(term.end_date)
	);
	return {
		days_present: record?.days_present ?? 0,
		total_days,
	};
};

export const recordBulkAttendance = async ({
	school_id,
	class_id,
	session_id,
	term_id,
	attendances,
}: {
	school_id: string;
	class_id: string;
	session_id: string;
	term_id: string;
	attendances: { student_id: string; days_present: number }[];
}) => {
	const created = await Attendance.bulkCreate(
		attendances.map((a) => ({
			school_id,
			class_id,
			session_id,
			term_id,
			...a,
		})),
		{ updateOnDuplicate: ['days_present'] }
	);
	return created;
};

export const getClassAttendance = async (
	school_id: string,
	class_id: string,
	session_id: string,
	term_id: string,
	total_school_days: number
) => {
	const records = await Attendance.findAll({
		where: { school_id, class_id, session_id, term_id },
		include: [
			{
				model: User,
				as: 'student',
				attributes: ['first_name', 'last_name', 'user_id'],
			},
		],
	});

	return records.map((r) => ({
		student: r.student_id,
		days_present: r.days_present,
		total_days: total_school_days,
	}));
};
