import ClassTeacher from '../models/class_teacher.model';
import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';

interface AssignDTO {
	school_id: string;
	class_id: string;
	teacher_id: string;
	session_id: string;
	term_id: string;
}

export const createClassTeacher = async (data: AssignDTO) => {
	const { school_id, class_id, teacher_id, session_id, term_id } = data;

	// Validate UUIDs
	[schema_id, class_id, teacher_id, session_id, term_id].forEach((id) => {
		if (!validateUUID(id)) throw new AppError('Invalid ID provided', 400);
	});

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

export const listClassTeachers = async (filters: any) => {
	return await ClassTeacher.findAll({
		where: filters,
		include: [
			{
				association: 'teacher',
				attributes: ['user_id', 'first_name', 'last_name'],
			},
			{ association: 'class', attributes: ['class_id', 'name'] },
			{ association: 'session', attributes: ['session_id', 'name'] },
			{ association: 'term', attributes: ['term_id', 'name'] },
		],
		order: [['createdAt', 'DESC']],
	});
};

export const deleteClassTeacher = async (id: string) => {
	if (!validateUUID(id)) throw new AppError('Invalid class teacher ID', 400);
	const record = await ClassTeacher.findByPk(id);
	if (!record) throw new AppError('Assignment not found', 404);
	await record.destroy();
};
