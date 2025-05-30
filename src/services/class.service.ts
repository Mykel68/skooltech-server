import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';
import Class from '../models/class.model';
import School from '../models/school.model';
import { ClassInstance } from '../types/models.types';
import ClassStudent from '../models/class_student.model';
import sequelize from '../config/db';

/**
 * Create a new class in a school
 * @returns Promise<ClassInstance>
 */
export const createClass = async (
	school_id: string,
	name: string,
	grade_level?: string,
	short?: string
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

export const getAllClassesOfSchool = async (
	school_id: string
): Promise<ClassInstance[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const classes = await Class.findAll({
		where: { school_id },
		include: [School],
		order: [['name', 'ASC']],
	});

	return classes;
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
