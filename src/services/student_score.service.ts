import { Op } from 'sequelize';
import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';
import StudentScore, {
	StudentScoreInstance,
} from '../models/student_score.model';
import GradingSetting from '../models/grading_setting.model';
import Class from '../models/class.model';
import User from '../models/user.model';
import ClassStudent from '../models/class_student.model';
import Subject from '../models/subject.model';
import Session from '../models/session.model';
import { Term } from '../models/term.model';

interface ScoreInput {
	user_id: string;
	scores: { component_name: string; score: number }[];
}

export const assignStudentScores = async (
	school_id: string,
	class_id: string,
	subject_id: string,
	teacher_id: string,
	scoreInputs: ScoreInput[]
): Promise<StudentScoreInstance[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);
	if (!validateUUID(subject_id))
		throw new AppError('Invalid subject ID', 400);
	if (!validateUUID(teacher_id))
		throw new AppError('Invalid teacher ID', 400);

	const subject = await Subject.findOne({
		where: { subject_id, school_id, teacher_id, class_id },
	});
	if (!subject) {
		throw new AppError(
			`Subject not found in this school: ${subject_id}`,
			404
		);
	}

	// Verify class exists in school
	const classRecord = await Class.findOne({
		where: { class_id, school_id },
	});
	if (!classRecord) throw new AppError('Class not found in this school', 404);

	// Verify teacher is authorized
	const teacher = await User.findOne({
		where: {
			user_id: teacher_id,
			school_id,
			role: 'Teacher',
			is_approved: true,
		},
	});
	if (!teacher)
		throw new AppError('Teacher not found or not authorized', 403);

	// Get grading setting
	const gradingSetting = await GradingSetting.findOne({
		where: { class_id, teacher_id, school_id },
	});
	console.log('Grading Setting Query:', {
		class_id,
		teacher_id,
		school_id,
		gradingSetting: gradingSetting ? gradingSetting.toJSON() : null,
	});
	if (!gradingSetting)
		throw new AppError(
			'Grading setting not found for this class and teacher',
			404
		);
	if (!gradingSetting.grading_setting_id) {
		console.error(
			'Grading Setting ID is undefined:',
			gradingSetting.toJSON()
		);
		throw new AppError('Invalid grading setting ID', 500);
	}

	// Validate component names
	const validComponents = gradingSetting.components.map((comp) => comp.name);
	const results: StudentScoreInstance[] = [];

	for (const input of scoreInputs) {
		if (!validateUUID(input.user_id))
			throw new AppError(`Invalid user ID: ${input.user_id}`, 400);

		// Verify student is in class
		const classStudent = await ClassStudent.findOne({
			where: { class_id, student_id: input.user_id },
		});
		if (!classStudent)
			throw new AppError(
				`Student not found in this class: ${input.user_id}`,
				404
			);

		// Validate scores
		if (
			!Array.isArray(input.scores) ||
			input.scores.length !== validComponents.length
		) {
			throw new AppError(
				`Scores must match grading components: ${validComponents.join(
					', '
				)}`,
				400
			);
		}

		const scoreMap = new Map(
			input.scores.map((s) => [s.component_name, s.score])
		);
		const missingComponents = validComponents.filter(
			(comp) => !scoreMap.has(comp)
		);
		if (missingComponents.length > 0) {
			throw new AppError(
				`Missing scores for components: ${missingComponents.join(
					', '
				)}`,
				400
			);
		}

		const invalidScores = input.scores.filter(
			(s) =>
				!validComponents.includes(s.component_name) ||
				typeof s.score !== 'number' ||
				isNaN(s.score) ||
				s.score < 0 ||
				s.score > 100
		);
		if (invalidScores.length > 0) {
			throw new AppError(
				`Invalid scores: ${JSON.stringify(invalidScores)}`,
				400
			);
		}

		// Calculate total score
		let total_score = 0;
		for (const comp of gradingSetting.components) {
			const score = scoreMap.get(comp.name) || 0;
			total_score += score;
		}

		// Check for existing score
		const existingScore = await StudentScore.findOne({
			where: {
				grading_setting_id: gradingSetting.grading_setting_id,
				user_id: input.user_id,
				class_id,
				subject_id,
			},
		});
		if (existingScore) {
			throw new AppError(
				`Scores already assigned for student ${input.user_id}. Use PATCH to update.`,
				409
			);
		}

		// Create score
		try {
			const studentScore = await StudentScore.create({
				grading_setting_id: gradingSetting.grading_setting_id as string,
				user_id: input.user_id,
				class_id,
				teacher_id,
				school_id,
				subject_id,
				scores: input.scores,
				total_score,
			});
			results.push(studentScore);
		} catch (error: any) {
			console.error('Student Score Creation Error:', error.message, {
				input,
				grading_setting_id: gradingSetting.grading_setting_id,
			});
			throw new AppError(
				`Failed to create student score: ${error.message}`,
				400
			);
		}
	}

	return results;
};

export const editStudentScores = async (
	school_id: string,
	class_id: string,
	subject_id: string,
	teacher_id: string,
	scoreInputs: ScoreInput[]
): Promise<StudentScoreInstance[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);
	if (!validateUUID(teacher_id))
		throw new AppError('Invalid teacher ID', 400);

	const subject = await Subject.findOne({
		where: { subject_id, school_id, class_id, teacher_id },
	});
	if (!subject) {
		throw new AppError(
			`Subject not found in this school: ${subject_id}`,
			404
		);
	}

	// Verify class exists in school
	const classRecord = await Class.findOne({
		where: { class_id, school_id },
	});
	if (!classRecord) throw new AppError('Class not found in this school', 404);

	// Verify teacher is authorized
	const teacher = await User.findOne({
		where: {
			user_id: teacher_id,
			school_id,
			role: 'Teacher',
			is_approved: true,
		},
	});
	if (!teacher)
		throw new AppError('Teacher not found or not authorized', 403);

	// Get grading setting
	const gradingSetting = await GradingSetting.findOne({
		where: { class_id, teacher_id, school_id, subject_id },
	});
	console.log('Grading Setting Query for Edit:', {
		class_id,
		teacher_id,
		school_id,
		gradingSetting: gradingSetting ? gradingSetting.toJSON() : null,
	});
	if (!gradingSetting)
		throw new AppError(
			'Grading setting not found for this class and teacher',
			404
		);
	if (!gradingSetting.grading_setting_id) {
		console.error(
			'Grading Setting ID is undefined:',
			gradingSetting.toJSON()
		);
		throw new AppError('Invalid grading setting ID', 500);
	}

	// Validate component names
	const validComponents = gradingSetting.components.map((comp) => comp.name);
	const results: StudentScoreInstance[] = [];

	for (const input of scoreInputs) {
		if (!validateUUID(input.user_id))
			throw new AppError(`Invalid user ID: ${input.user_id}`, 400);

		// Verify student is in class
		const classStudent = await ClassStudent.findOne({
			where: { class_id, student_id: input.user_id },
		});
		if (!classStudent)
			throw new AppError(
				`Student not found in this class: ${input.user_id}`,
				404
			);

		// Validate scores
		if (
			!Array.isArray(input.scores) ||
			input.scores.length !== validComponents.length
		) {
			throw new AppError(
				`Scores must match grading components: ${validComponents.join(
					', '
				)}`,
				400
			);
		}

		const scoreMap = new Map(
			input.scores.map((s) => [s.component_name, s.score])
		);
		const missingComponents = validComponents.filter(
			(comp) => !scoreMap.has(comp)
		);
		if (missingComponents.length > 0) {
			throw new AppError(
				`Missing scores for components: ${missingComponents.join(
					', '
				)}`,
				400
			);
		}

		const invalidScores = input.scores.filter(
			(s) =>
				!validComponents.includes(s.component_name) ||
				typeof s.score !== 'number' ||
				isNaN(s.score) ||
				s.score < 0 ||
				s.score > 100
		);
		if (invalidScores.length > 0) {
			throw new AppError(
				`Invalid scores: ${JSON.stringify(invalidScores)}`,
				400
			);
		}

		// Calculate total score
		let total_score = 0;
		for (const comp of gradingSetting.components) {
			const score = scoreMap.get(comp.name) || 0;
			total_score += score;
		}

		// Find existing score
		const existingScore = await StudentScore.findOne({
			where: {
				grading_setting_id: gradingSetting.grading_setting_id,
				user_id: input.user_id,
				class_id,
			},
		});

		if (!existingScore) {
			console.warn(
				`Skipping student ${input.user_id}: No existing score record`
			);
			continue;
		}

		try {
			// Update existing score
			const studentScore = await existingScore.update({
				scores: input.scores,
				total_score,
			});
			console.log('Score Updated:', {
				user_id: input.user_id,
				scores: input.scores,
				total_score,
			});
			results.push(studentScore);
		} catch (error: any) {
			console.error('Student Score Update Error:', error.message, {
				input,
				grading_setting_id: gradingSetting.grading_setting_id,
			});
			throw new AppError(
				`Failed to update student score: ${error.message}`,
				400
			);
		}
	}

	return results;
};

/**
 * Fetch all students in a class + their scores for a specific subject,
 * returning the *subject-specific* grading components.
 */
export const getStudentScores = async (
	school_id: string,
	class_id: string,
	subject_id: string,
	teacher_id: string
): Promise<
	Array<{
		class: {
			class_id: string;
			name: string;
			grade_level: string | null;
		};
		grading: { name: string; weight: number }[]; // subject-specific components
		students: Array<{
			student: {
				user_id: string;
				first_name: string;
				last_name: string;
				score_id: string | null;
				scores: { component_name: string; score: number }[];
				total_score: number | null;
				average_score: number | null;
			};
		}>;
	}>
> => {
	// 1) Validate all IDs
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);
	if (!validateUUID(subject_id))
		throw new AppError('Invalid subject ID', 400);
	if (!validateUUID(teacher_id))
		throw new AppError('Invalid teacher ID', 400);

	// 2) Verify class belongs to school
	const classRecord = await Class.findOne({
		where: { class_id, school_id },
	});
	if (!classRecord) {
		throw new AppError('Class not found in this school', 404);
	}

	// 3) Verify subject belongs to class, teacher, and school
	const subjectRecord = await Subject.findOne({
		where: { subject_id, class_id, teacher_id, school_id },
		attributes: ['subject_id', 'name'],
	});
	if (!subjectRecord) {
		throw new AppError(
			'Subject not found for this class/teacher/school',
			404
		);
	}

	// 4) Verify teacher is approved and belongs to that school
	const teacherRecord = await User.findOne({
		where: {
			user_id: teacher_id,
			school_id,
			role: 'Teacher',
			is_approved: true,
		},
	});
	if (!teacherRecord) {
		throw new AppError('Teacher not authorized', 403);
	}

	// 5) Fetch the grading setting for this exact subject
	const gradingSetting = await GradingSetting.findOne({
		where: { class_id, subject_id, teacher_id, school_id },
		attributes: ['grading_setting_id', 'components'],
	});
	if (!gradingSetting) {
		throw new AppError(
			'Grading setting not found for this class/subject/teacher',
			404
		);
	}

	// 6) Get all students in that class
	const classStudents = await ClassStudent.findAll({
		where: { class_id },
		include: [
			{
				model: User,
				as: 'student',
				where: { role: 'Student', is_approved: true },
				attributes: ['user_id', 'first_name', 'last_name'],
				required: true,
			},
		],
	});

	// 7) If no students, return empty list
	if (classStudents.length === 0) {
		return [
			{
				class: {
					class_id: classRecord.class_id!,
					name: classRecord.name,
					grade_level: classRecord.grade_level!,
				},
				grading: gradingSetting.components,
				students: [],
			},
		];
	}

	// 8) Map enrolled student IDs
	const enrolledStudentIds = classStudents
		.map((cs) => cs.student!.user_id)
		.filter((uid): uid is string => typeof uid === 'string');

	// 9) Fetch any existing scores for this subject
	const existingScores = await StudentScore.findAll({
		where: {
			class_id,
			subject_id,
			school_id,
			teacher_id,
			grading_setting_id: gradingSetting.grading_setting_id,
			user_id: enrolledStudentIds,
		},
		attributes: ['user_id', 'score_id', 'scores', 'total_score'],
	});

	// 10) Build a quick lookup map: user_id → StudentScore row
	const scoreMap = new Map<string, (typeof existingScores)[0]>();
	existingScores.forEach((sc) => {
		scoreMap.set(sc.user_id, sc);
	});

	// 11) Build the students list, defaulting to empty scores if none exist
	const studentsWithScores = classStudents.map((cs) => {
		const stu = cs.student!;
		const existing = scoreMap.get(stu.user_id!) || null;

		const userId = stu.user_id!;
		const firstName = stu.first_name!;
		const lastName = stu.last_name!;

		const scores = existing?.scores ?? [];
		const total_score = scores.reduce((sum, s) => sum + s.score, 0);
		const average_score =
			scores.length > 0 ? total_score / scores.length : null;

		return {
			student: {
				user_id: userId,
				first_name: firstName,
				last_name: lastName,
				score_id: existing?.score_id ?? null,
				scores,
				total_score: scores.length > 0 ? total_score : null,
				average_score,
			},
		};
	});

	// 12) Return the single-element array, now including subject-specific grading components
	return [
		{
			class: {
				class_id: classRecord.class_id!,
				name: classRecord.name,
				grade_level: classRecord.grade_level!,
			},
			grading: gradingSetting.components,
			students: studentsWithScores,
		},
	];
};

export const editBulkStudentScores = async (
	school_id: string,
	class_id: string,
	teacher_id: string,
	scoreInputs: ScoreInput[]
): Promise<StudentScoreInstance[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);
	if (!validateUUID(teacher_id))
		throw new AppError('Invalid teacher ID', 400);

	// Verify class exists in school
	const classRecord = await Class.findOne({
		where: { class_id, school_id },
	});
	if (!classRecord) throw new AppError('Class not found in this school', 404);

	// Verify teacher is authorized
	const teacher = await User.findOne({
		where: {
			user_id: teacher_id,
			school_id,
			role: 'Teacher',
			is_approved: true,
		},
	});
	if (!teacher)
		throw new AppError('Teacher not found or not authorized', 403);

	// Get grading setting
	const gradingSetting = await GradingSetting.findOne({
		where: { class_id, teacher_id, school_id },
	});
	if (!gradingSetting)
		throw new AppError(
			'Grading setting not found for this class and teacher',
			404
		);
	if (!gradingSetting.grading_setting_id) {
		throw new AppError('Invalid grading setting ID', 500);
	}

	// Validate component names
	const validComponents = gradingSetting.components.map((comp) => comp.name);

	// Collect user_ids to bulk verify their enrollment
	const userIds = scoreInputs.map((input) => input.user_id);

	// Bulk verify all students are in the class
	const enrolledStudents = await ClassStudent.findAll({
		where: { class_id, student_id: { [Op.in]: userIds } },
	});

	const enrolledStudentIds = enrolledStudents.map((cs) => cs.student_id);
	const missingStudents = userIds.filter(
		(id) => !enrolledStudentIds.includes(id)
	);
	if (missingStudents.length > 0) {
		throw new AppError(
			`Students not found in this class: ${missingStudents.join(', ')}`,
			404
		);
	}

	const results: StudentScoreInstance[] = [];

	// Use a transaction to ensure all-or-nothing updates
	const updatedScores = await StudentScore.sequelize?.transaction(
		async (t) => {
			for (const input of scoreInputs) {
				if (!validateUUID(input.user_id)) {
					throw new AppError(
						`Invalid user ID: ${input.user_id}`,
						400
					);
				}

				// Validate scores length and components
				if (
					!Array.isArray(input.scores) ||
					input.scores.length !== validComponents.length
				) {
					throw new AppError(
						`Scores must match grading components: ${validComponents.join(
							', '
						)}`,
						400
					);
				}

				const scoreMap = new Map(
					input.scores.map((s) => [s.component_name, s.score])
				);
				const missingComponents = validComponents.filter(
					(comp) => !scoreMap.has(comp)
				);
				if (missingComponents.length > 0) {
					throw new AppError(
						`Missing scores for components: ${missingComponents.join(
							', '
						)}`,
						400
					);
				}

				const invalidScores = input.scores.filter(
					(s) =>
						!validComponents.includes(s.component_name) ||
						typeof s.score !== 'number' ||
						isNaN(s.score) ||
						s.score < 0 ||
						s.score > 100
				);
				if (invalidScores.length > 0) {
					throw new AppError(
						`Invalid scores: ${JSON.stringify(invalidScores)}`,
						400
					);
				}

				// Calculate total score
				let total_score = 0;
				for (const comp of gradingSetting.components) {
					const score = scoreMap.get(comp.name) || 0;
					total_score += (score * comp.weight) / 100;
				}

				// Find existing score record
				const existingScore = await StudentScore.findOne({
					where: {
						grading_setting_id: gradingSetting.grading_setting_id,
						user_id: input.user_id,
						class_id,
					},
					transaction: t,
					lock: t.LOCK.UPDATE, // Lock for update inside transaction
				});

				if (!existingScore) {
					throw new AppError(
						`No scores found for student ${input.user_id} in this class. Use POST to create.`,
						404
					);
				}

				// Update score record
				const updatedScore = await existingScore.update(
					{
						scores: input.scores,
						total_score,
					},
					{ transaction: t }
				);

				results.push(updatedScore);
			}

			return results;
		}
	);

	return updatedScores ?? results;
};

export const getStudentOwnScores = async (
	school_id: string,
	class_id: string,
	student_id: string
): Promise<any> => {
	// 1) Validate all IDs
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);
	if (!validateUUID(student_id))
		throw new AppError('Invalid student ID', 400);

	// 2) Verify that the class exists
	const classRecord = await Class.findOne({
		where: { class_id, school_id },
	});
	if (!classRecord) throw new AppError('Class not found in this school', 404);

	// 3) Fetch all of this student’s scores in that class
	const studentScores = await StudentScore.findAll({
		where: {
			class_id,
			school_id,
			user_id: student_id,
		},
		include: [
			{
				model: User,
				as: 'teacher',
				attributes: ['user_id', 'first_name', 'last_name'],
			},
			{
				model: GradingSetting,
				as: 'grading_setting',
				attributes: ['grading_setting_id', 'components'],
			},
			{
				model: Subject,
				as: 'subject',
				attributes: ['subject_id', 'name', 'short'],
			},
		],
		attributes: [
			'score_id',
			'scores',
			'total_score',
			'created_at',
			'updated_at',
		],
	});

	// 4) Collect all subject IDs that the student has scores for
	const subjectIds = studentScores
		.map((s) => s.subject?.subject_id)
		.filter(Boolean);

	// 5) Fetch every StudentScore for those subjects in this class (to compute class averages)
	const allScoresForSubjects = await StudentScore.findAll({
		where: {
			class_id,
			school_id,
			subject_id: {
				[Op.in]: subjectIds.filter(
					(id): id is string => typeof id === 'string'
				),
			},
		},
		attributes: ['subject_id', 'total_score'],
	});

	// 6) Compute class averages per subject
	const classAveragesMap = new Map<string, number>();
	const subjectGroups = allScoresForSubjects.reduce((acc, score) => {
		const subjId = score.subject_id;
		if (!subjId || score.total_score == null) return acc;
		if (!acc[subjId]) acc[subjId] = [];
		acc[subjId].push(score.total_score);
		return acc;
	}, {} as Record<string, number[]>);

	for (const [subjectId, scores] of Object.entries(subjectGroups)) {
		const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
		classAveragesMap.set(subjectId, Number(avg.toFixed(2)));
	}

	// 7) Build the response
	return {
		class: {
			class_id: classRecord.class_id,
			name: classRecord.name,
			grade_level: classRecord.grade_level,
		},
		subjectsWithScores: studentScores.map((s) => {
			const gradingComponents = s.grading_setting?.components || [];
			const gradingTotal = gradingComponents.reduce(
				(acc, comp) =>
					acc + (typeof comp.weight === 'number' ? comp.weight : 0),
				0
			);

			// For each score entry, look up its component’s max (weight) in gradingComponents
			const scoresWithComponentTotals = (s.scores || []).map(
				(scoreObj) => {
					const matchingComp = gradingComponents.find(
						(comp) => comp.name === scoreObj.component_name
					);
					return {
						component_name: scoreObj.component_name,
						score: scoreObj.score,
						component_total: matchingComp
							? matchingComp.weight
							: null,
					};
				}
			);

			return {
				subject: {
					subject_id: s.subject?.subject_id,
					name: s.subject?.name,
					short: s.subject?.short,
				},
				score_id: s.score_id,
				scores: scoresWithComponentTotals,
				total_score: s.total_score,
				grading_total: gradingTotal,
				class_average: s.subject?.subject_id
					? classAveragesMap.get(s.subject.subject_id) ?? null
					: null,
			};
		}),
	};
};

export const getStudentSubjectsAndScores = async (
	school_id: string,
	student_id: string
): Promise<any[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(student_id))
		throw new AppError('Invalid student ID', 400);

	const student = await User.findOne({
		where: {
			user_id: student_id,
			school_id,
			role: 'Student',
			is_approved: true,
		},
	});

	if (!student)
		throw new AppError('Student not found or not authorized', 404);

	const classStudents = await ClassStudent.findAll({
		where: { student_id },
		include: [
			{
				model: Class,
				as: 'class',
				attributes: ['class_id', 'name', 'grade_level'],
			},
		],
	});

	if (!classStudents.length) return [];

	const classIds = classStudents.map((cs) => cs.class_id);

	const scores = await StudentScore.findAll({
		where: {
			school_id,
			user_id: student_id,
			class_id: { [Op.in]: classIds },
		},
		include: [
			{
				model: User,
				as: 'teacher',
				attributes: ['user_id', 'first_name', 'last_name'],
			},
			{
				model: Class,
				as: 'class',
				attributes: ['class_id', 'name', 'grade_level'],
			},
			{
				model: GradingSetting,
				as: 'grading_setting',
				attributes: ['grading_setting_id', 'components'],
				include: [
					{
						model: Subject,
						as: 'subject',
						attributes: ['subject_id', 'name'],
					},
				],
			},
		],
		attributes: ['score_id', 'class_id', 'scores', 'total_score'],
	});

	return scores.map((score) => {
		const gradingSetting = score.grading_setting_id as any;
		const subject = gradingSetting?.subject;
		const classInfo = score.class_id as any;

		return {
			score_id: score.score_id,
			class: {
				class_id: classInfo?.class_id ?? '',
				name: classInfo?.name ?? 'Unknown',
				grade_level: classInfo?.grade_level ?? 'Unknown',
			},
			subject: {
				subject_id: subject?.subject_id ?? '',
				name: subject?.name ?? 'Unknown',
			},
			scores: score.scores,
			total_score: score.total_score,
			grade: score.total_score, // You might want to compute this differently
		};
	});
};

export const getStudentsInSession = async (
	school_id: string,
	session_id: string
): Promise<any[]> => {
	// Validate IDs (optional but recommended)
	if (!validateUUID(school_id)) throw new AppError('Invalid school_id', 400);
	if (!validateUUID(session_id))
		throw new AppError('Invalid session_id', 400);

	const students = await User.findAll({
		where: {
			school_id,
			role: 'Student',
		},
		include: [
			{
				model: ClassStudent,
				where: { session_id },
				required: true,
				include: [
					{
						model: Class,
						attributes: ['class_id', 'name'],
					},
				],
			},
		],
		attributes: {
			exclude: ['password_hash'],
		},
	});

	return students;
};

export const getStudentsWithResults = async (
	school_id: string,
	session_id: string,
	term_id: string,
	class_id: string
) => {
	const students = await User.findAll({
		where: {
			school_id,
			role: 'Student',
		},
		include: [
			{
				model: ClassStudent,
				as: 'class_students',
				where: {
					session_id,
					term_id,
					class_id,
				},
				include: [
					{
						model: Session,
						attributes: ['session_id', 'name'], // session name
					},
					{
						model: Term,
						attributes: ['term_id', 'name'], // term name
					},
					{
						model: Class,
						attributes: ['name', 'class_id'],
					},
				],
			},
			{
				model: StudentScore,
				as: 'student_scores',
				required: false,
				include: [
					{
						model: Subject,
						as: 'subject',
						where: { session_id, term_id, class_id },
						attributes: ['name', 'subject_id'],
					},
					{
						model: User,
						as: 'teacher',
						attributes: ['first_name', 'last_name', 'user_id'],
					},
				],
			},
		],
		attributes: ['user_id', 'first_name', 'last_name'],
		order: [['first_name', 'ASC']],
	});

	return students;
};
