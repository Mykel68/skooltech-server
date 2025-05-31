import Assessment from '../models/assessment.model';
import Class from '../models/class.model';
import ClassStudent from '../models/class_student.model';
import GradeScale from '../models/gradeScale.model';
import GradingConfig from '../models/gradingConfig.model';
import Score from '../models/score.model';
import Student from '../models/student.model';
import StudentScore, {
	StudentScoreInstance,
} from '../models/student_score.model';
import Subject from '../models/subject.model';
import { School, Term } from '../models/term.model';
import User from '../models/user.model';
import { ClassStudentInstance } from '../types/models.types';
import { AppError } from '../utils/error.util';
import { validateUUID } from '../utils/validation.util';

interface SubjectWithScore {
	subject_id: string;
	name: string;
	score_id: string | null;
	scores: { component_name: string; score: number }[];
	total_score: number | null;
}

interface ScoreData {
	score_id: string | null;
	scores: { component_name: string; score: number }[];
	total_score: number | null;
}

export const getStudentByClass = async (
	school_id: string,
	class_id: string
): Promise<any[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);
	if (!validateUUID(class_id)) throw new AppError('Invalid class ID', 400);

	// Verify class belongs to the school
	const classRecord = await Class.findOne({
		where: { class_id, school_id },
	});
	if (!classRecord) throw new AppError('Class not found in this school', 404);

	// Query the join table with eager loading of students
	const enrolledStudents = await ClassStudent.findAll({
		where: { class_id },
		include: [
			{
				model: User,
				as: 'student', // make sure this alias matches your association
				where: { role: 'Student', school_id },
				attributes: { exclude: ['password_hash'] }, // exclude sensitive info if you want
			},
		],
	});

	if (!enrolledStudents.length)
		throw new AppError('No students found in this class', 404);

	// Map to a cleaner response including student data and class info
	const students = enrolledStudents.map((enrollment: any) => ({
		...enrollment.student.toJSON(),
		class: classRecord.toJSON(),
	}));

	return students;
};

export const getStudentsBySchool = async (
	school_id: string
): Promise<any[]> => {
	if (!validateUUID(school_id)) throw new AppError('Invalid school ID', 400);

	const school = await School.findByPk(school_id);
	if (!school) throw new AppError('School not found', 404);

	const students = await Student.findAll({
		where: { school_id },
		include: [
			{
				model: User,
				as: 'user',
				attributes: [
					'user_id',
					'username',
					'email',
					'first_name',
					'last_name',
					'role',
					'school_id',
					'is_approved',
				],
			},
			{
				model: Class,
				as: 'class',
				attributes: ['class_id', 'name'],
			},
		],
		order: [
			['user', 'last_name', 'ASC'],
			['user', 'first_name', 'ASC'],
		],
	});

	return students.map((student) => ({
		...student.user.toJSON(),
		class: student.class ? student.class.toJSON() : null,
	}));
};

export const getStudentSubjectScoresService = async (
	studentId: string,
	classId: string
): Promise<{
	student: { user_id: string; full_name: string };
	class_id: string;
	subjects: SubjectWithScore[];
}> => {
	// Fetch student info from ClassStudent join table including the User details
	const classStudent = await ClassStudent.findOne({
		where: {
			student_id: studentId,
			class_id: classId,
		},
		attributes: ['student_id'],
		include: [
			{
				model: User,
				as: 'student', // matches the alias in your model association
				attributes: ['first_name', 'last_name', 'user_id'],
			},
		],
	});

	if (!classStudent || !classStudent.student) {
		throw new Error(
			`Student with id ${studentId} not found in class ${classId}`
		);
	}

	// Fetch subjects for the class
	const subjects = await Subject.findAll({
		where: { class_id: classId },
		attributes: ['subject_id', 'name'],
	});

	// Fetch scores for the student in the class
	const studentScores = await StudentScore.findAll({
		where: {
			user_id: studentId,
			class_id: classId,
		},
		attributes: ['score_id', 'grading_setting_id', 'scores', 'total_score'],
	});

	// Map subject_id to score data
	const scoreMap = new Map<
		string,
		{ score_id: string; scores: any; total_score: number | null }
	>();
	studentScores.forEach((score) => {
		if (score.subject_id) {
			scoreMap.set(score.subject_id, {
				score_id: score.score_id!,
				scores: score.scores,
				total_score: score.total_score,
			});
		}
	});

	// Format subjects with scores
	const formattedSubjects: SubjectWithScore[] = subjects
		.filter((subject) => subject.subject_id !== undefined)
		.map((subject) => {
			const subjectId = subject.subject_id!;
			const score = scoreMap.get(subjectId);

			return {
				subject_id: subjectId,
				name: subject.name,
				score_id: score?.score_id ?? null,
				scores: score?.scores ?? [],
				total_score: score?.total_score ?? null,
			};
		});

	return {
		student: {
			user_id: classStudent.student_id,
			full_name: `${classStudent.student.first_name} ${classStudent.student.last_name}`,
		},
		class_id: classId,
		subjects: formattedSubjects,
	};
};
// export const getStudentInClass = async (
//   class_id: string,
//   student_id: string
// ): Promise<any> => {
//   if (!validateUUID(class_id)) throw new AppError("Invalid class ID", 400);
//   if (!validateUUID(student_id)) throw new AppError("Invalid student ID", 400);

//   const student = await User.findOne({
//     where: { user_id: student_id, role: "Student" },
//   });
//   if (!student) throw new AppError("Student not found", 404);
//   if (student.school_id !== class_id.school_id)
//     throw new AppError("Student does not belong to this school", 403);

//   const enrollment = await ClassStudent.findOne({
//     where: { class_id, student_id },
//   });
//   if (!enrollment)
//     throw new AppError("Student not enrolled in this class", 403);

//   return student;
// };

// export const getStudentByClass = async (
//   class_id: string,
//   school_id: string
// ): Promise<any> => {
//   if (!class_id) throw new AppError("Invalid class ID", 400);
//   if (!school_id) throw new AppError("Invalid student ID", 400);

//   const student = await User.findOne({
//     where: { school_id, role: "Student" },
//   });
//   if (!student) throw new AppError("Student not found", 404);
//   return student;
// };

export const getStudentById = async (user_id: string): Promise<any> => {
	if (!user_id) throw new AppError('Invalid user ID', 400);

	const student = await User.findOne({
		where: { user_id, role: 'Student' },
	});
	if (!student) throw new AppError('Student not found', 404);
	return student;
};

// export const getStudentBySchool = async (school_id: string): Promise<any[]> => {
//   if (!validateUUID(school_id)) throw new AppError("Invalid school id", 400);
//   const school = await School.findByPk(school_id);
//   if (!school) throw new AppError("School not found", 404);

//   const students = await Student.findAll({
//     where: { school_id },
//     include: [
//       {
//         model: User,
//         as: "user",
//         attributes: [
//           "user_id",
//           "username",
//           "email",
//           "first_name",
//           "lastname",
//           "is_approved",
//         ],
//       },
//       {
//         model: Class,
//         as: "class",
//         attributes: ["class_id", "name"],
//       },
//     ],
//     order: [
//       ["user", "lastname", "ASC"],
//       ["user", "first_name", "ASC"],
//     ],
//   });
//   return students.map((student) => ({
//     ...student.user.toJSON(),
//     class: student.class ? student.class.toJSON() : null,
//   }));
// };

// export const getStudentScores = async (
//   student_id: string,
//   class_id: string,
//   term_id: string
// ): Promise<any[]> => {
//   if (!student_id) throw new AppError("Invalid student ID", 400);
//   if (!class_id) throw new AppError("Invalid class ID", 400);
//   if (!term_id) throw new AppError("Invalid term ID", 400);

//   const student = await User.findOne({
//     where: { user_id: student_id, role: "Student" },
//   });
//   if (!student) throw new AppError("Student not found", 404);
//   if (student.school_id !== class_id.school_id)
//     throw new AppError("Student does not belong to this school", 403);

//   const enrollment = await ClassStudent.findOne({
//     where: { class_id, student_id },
//   });
//   if (!enrollment)
//     throw new AppError("Student not enrolled in this class", 403);

//   const scores = await Score.findAll({
//     where: { student_id },
//     include: [
//       {
//         model: Assessment,
//         where: { class_id, term_id },
//         include: [
//           { model: Subject, attributes: ["subject_id", "name"] },
//           { model: Term, attributes: ["term_id", "name"] },
//         ],
//       },
//     ],
//   });

//   const gradingConfigs = await GradingConfig.findAll({
//     where: { school_id: student.school_id },
//   });
//   const gradeScales = await GradeScale.findAll({
//     where: { school_id: student.school_id },
//   });

//   return scores.map((score) => {
//     const assessment = score.assessment;
//     const percentage = (score.score / assessment.max_score) * 100;
//     const gradeScale = gradeScales.find(
//       (scale) => percentage >= scale.min_score && percentage <= scale.max_score
//     );
//     const config = gradingConfigs.find(
//       (config) => config.assessment_type === assessment.type
//     );
//     return {
//       score_id: score.score_id,
//       assessment_id: score.assessment_id,
//       assessment_name: assessment.name,
//       assessment_type: assessment.type,
//       assessment_date: assessment.date,
//       term_id: assessment.term.term_id,
//       term_name: assessment.term.name,
//       subject_id: assessment.subject.subject_id,
//       subject_name: assessment.subject.name,
//       class_id: assessment.class_id,
//       score: score.score,
//       max_score: assessment.max_score,
//       percentage,
//       letter_grade: gradeScale ? gradeScale.letter_grade : null,
//       weight: config ? config.weight : null,
//     };
//   });
// };
