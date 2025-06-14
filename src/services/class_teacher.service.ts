import { string } from 'joi';
import ClassTeacher from '../models/class_teacher.model';
import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';

export const createClassTeacher = async (
	school_id: string,
	session_id: string,
	term_id: string,
	teacher_id: string,
	class_id: string
) => {
	// Validate UUIDs

	if (!validateUUID(school_id))
		throw new AppError('Invalid school ID provided', 400);
	if (!validateUUID(session_id))
		throw new AppError('Invalid session ID provided', 400);
	if (!validateUUID(term_id))
		throw new AppError('Invalid term ID provided', 400);
	if (!validateUUID(teacher_id))
		throw new AppError('Invalid teacher ID provided', 400);
	if (!validateUUID(class_id))
		throw new AppError('Invalid class ID provided', 400);

	// Prevent duplicate
	const exists = await ClassTeacher.findOne({
		where: { class_id, session_id, term_id },
	});
	if (exists)
		throw new AppError(
			'A teacher is already assigned to this class for the selected session and term',
			400
		);

	const assignment = await ClassTeacher.create({
		school_id,
		class_id,
		teacher_id,
		session_id,
		term_id,
	});
	return assignment;
};

export const listClassTeachers = async (
	school_id: string,
	session_id: string,
	term_id: string
) => {
	return await ClassTeacher.findAll({
		where: { session_id, school_id, term_id },
		include: [
			{
				association: 'teacher',
				attributes: ['user_id', 'first_name', 'last_name'],
			},
			{
				association: 'class',
				attributes: ['class_id', 'grade_level', 'name'],
			},
			{ association: 'session', attributes: ['session_id', 'name'] },
			{ association: 'term', attributes: ['term_id', 'name'] },
		],
	});
};

export const deleteClassTeacher = async (id: string) => {
	if (!validateUUID(id)) throw new AppError('Invalid class teacher ID', 400);
	const record = await ClassTeacher.findByPk(id);
	if (!record) throw new AppError('Assignment not found', 404);
	await record.destroy();
};
