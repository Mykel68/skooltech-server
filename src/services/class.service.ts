import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';
import Class, { ClassInstance } from '../models/class.model';
import School from '../models/school.model';
import ClassStudent from '../models/class_student.model';
import sequelize from '../config/db';
import User from '../models/user.model';
import Subject from '../models/subject.model';
import ClassTeacher from '../models/class_teacher.model';

/**
 * Create a new class in a school
 * @returns Promise<ClassInstance>
 */
export const createClass = async (
	school_id: string,
	name: string,
	grade_level: string,
	short: string
): Promise<ClassInstance> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!name) throw new AppError('Class name is required', 400);

	const school = await School.findByPk(school_id);
	if (!school) throw new AppError('School not found', 404);

	const classInstance = await Class.create({
		school_id,
		name,
		grade_level,
		short,
	});
	return classInstance;
};

/**
 * Get a class by ID and school ID
 * @returns Promise<ClassInstance>
 */
export const getClassById = async (
	class_id: string,
	school_id: string
): Promise<ClassInstance> => {
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const classInstance = await Class.findOne({
		where: { class_id, school_id },
	});

	if (!classInstance) throw new AppError('Class not found', 404);

	return classInstance;
};

/**
 * Update a class
 * @returns Promise<ClassInstance>
 */
export const updateClass = async (
	class_id: string,
	school_id: string,
	updates: Partial<Pick<ClassInstance, 'name' | 'grade_level' | 'short'>>
): Promise<ClassInstance> => {
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const classInstance = await Class.findOne({
		where: { class_id, school_id },
	});
	if (!classInstance) throw new AppError('Class not found', 404);

	await classInstance.update(updates);
	return classInstance;
};

/**
 * Delete a class by ID
 * @returns Promise<void>
 */
export const deleteClass = async (
	class_id: string,
	school_id: string
): Promise<void> => {
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const classInstance = await Class.findOne({
		where: { class_id, school_id },
	});
	if (!classInstance) throw new AppError('Class not found', 404);

	await classInstance.destroy();
};

export const getAllClassesOfSchool = async (
	school_id: string,
	session_id: string,
	term_id: string
): Promise<any[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const classes = await Class.findAll({
		where: { school_id },
		attributes: [
			'class_id',
			'school_id',
			'name',
			'grade_level',
			'short',
			'created_at',
		],
		include: [
			{
				model: ClassStudent,
				as: 'class_students',
				required: false,
				where: {
					session_id,
					term_id,
				},
				attributes: ['student_id'],
			},
			{
				model: Subject,
				as: 'subjects',
				required: false,
				where: {
					session_id,
					term_id,
				},
				attributes: ['name'],
			},
			{
				model: ClassTeacher,
				as: 'class_teachers',
				required: false,
				where: {
					session_id,
					term_id,
				},
				include: [
					{
						model: User,
						as: 'teacher',
						attributes: ['first_name', 'last_name'],
					},
				],
			},
		],
		order: [['name', 'ASC']],
	});

	return classes.map((c) => ({
		class_id: c.class_id,
		school_id: c.school_id,
		name: c.name,
		grade_level: c.grade_level,
		short: c.short,
		created_at: c.created_at,
		student_count: c.class_students?.length || 0,
		teacher: c.class_teachers?.[0]?.teacher
			? `${c.class_teachers[0].teacher.first_name} ${c.class_teachers[0].teacher.last_name}`
			: null,
		subjects: c.subjects?.map((s) => s.name) || [],
	}));
};

export const getStudentClass = async (
	school_id: string,
	student_id: string
): Promise<ClassInstance & { student_count: number }> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(student_id))
		throw new AppError('Invalid student ID', 400);

	// Step 1: Find class_id from ClassStudent
	const classStudent = await ClassStudent.findOne({
		where: { student_id },
		attributes: ['class_id'],
	});

	if (!classStudent || !classStudent.class_id) {
		throw new AppError('Student is not assigned to a class', 404);
	}

	// Step 2: Find the class with student count
	const classData = await Class.findOne({
		where: {
			class_id: classStudent.class_id,
			school_id,
		},
		attributes: {
			include: [
				[
					sequelize.literal(`(
            SELECT COUNT(*) FROM class_students
            WHERE class_students.class_id = "Class"."class_id"
          )`),
					'student_count',
				],
			],
		},
		raw: true,
	});

	if (!classData) {
		throw new AppError('Class not found', 404);
	}

	return classData as ClassInstance & { student_count: number };
};

// export const createClassTeacher = async()
