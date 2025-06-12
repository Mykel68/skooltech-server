import { Response, NextFunction } from 'express';
import {
	assignStudentScores,
	editStudentScores,
	getStudentOwnScores,
	getStudentScores,
	getStudentsInSession,
	getStudentSubjectsAndScores,
	getStudentsWithResults,
} from '../services/student_score.service';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const assignScores = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized: No user data', 401);
		}

		const { school_id, class_id, subject_id } = req.params;
		const { scores } = req.body;
		const teacher_id = req.user.user_id;

		console.log('Assign Scores Request:', {
			school_id,
			class_id,
			teacher_id,
			subject_id,
			scores,
		});

		const studentScores = await assignStudentScores(
			school_id,
			class_id,
			subject_id,
			teacher_id,
			scores
		);

		sendResponse(res, 201, {
			message: 'Student scores created successfully',
			data: studentScores,
		});
	} catch (error: any) {
		console.error('Assign Scores Error:', error.message, {
			body: req.body,
			errorDetails: error,
		});
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

export const editScores = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized: No user data', 401);
		}

		const { school_id, class_id, subject_id } = req.params;
		const { scores } = req.body;
		const teacher_id = req.user.user_id;

		console.log('Edit Scores Request:', {
			school_id,
			class_id,
			subject_id,
			teacher_id,
			scores,
		});

		const studentScores = await editStudentScores(
			school_id,
			class_id,
			subject_id,
			teacher_id,
			scores
		);

		sendResponse(res, 200, {
			message: 'Student scores updated successfully',
			data: studentScores,
		});
	} catch (error: any) {
		console.error('Edit Scores Error:', error.message, {
			body: req.body,
			errorDetails: error,
		});
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

export const getScores = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized: No user data', 401);
		}

		const { school_id, class_id, subject_id } = req.params;
		const teacher_id = req.user.user_id;

		console.log('Get Scores Request:', { school_id, class_id, teacher_id });

		const studentScores = await getStudentScores(
			school_id,
			class_id,
			subject_id,
			teacher_id
		);

		sendResponse(res, 200, {
			message: 'Student scores retrieved successfully',
			data: studentScores,
		});
	} catch (error: any) {
		console.error('Get Scores Error:', error.message, {
			params: req.params,
			errorDetails: error,
		});
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

// export const bulkAssignScores = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (!req.user) {
//       throw new AppError("Unauthorized: No user data", 401);
//     }

//     const { school_id, class_id } = req.params;
//     const { scores } = req.body;
//     const teacher_id = req.user.user_id;

//     console.log("Assign Scores Request:", {
//       school_id,
//       class_id,
//       teacher_id,
//       scores,
//     });

//     const studentScores = await assignStudentScores(
//       school_id,
//       class_id,
//       teacher_id,
//       scores
//     );

//     sendResponse(res, 201, {
//       message: "Student scores created successfully",
//       data: studentScores,
//     });
//   } catch (error: any) {
//     console.error("Assign Scores Error:", error.message, {
//       body: req.body,
//       errorDetails: error,
//     });
//     sendResponse(res, error.statusCode || 500, {
//       message: error.message || "Internal server error",
//     });
//   }
// };

export const bulkEditScores = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized: No user data', 401);
		}

		const { school_id, class_id, subject_id } = req.params;
		const { scores } = req.body;
		const teacher_id = req.user.user_id;

		console.log('Edit Scores Request:', {
			school_id,
			class_id,
			teacher_id,
			scores,
		});

		const studentScores = await editStudentScores(
			school_id,
			class_id,
			subject_id,
			teacher_id,
			scores
		);

		sendResponse(res, 200, {
			message: 'Student scores updated successfully',
			data: studentScores,
		});
	} catch (error: any) {
		console.error('Edit Scores Error:', error.message, {
			body: req.body,
			errorDetails: error,
		});
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

export const getOwnScores = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized: No user data', 401);
		}

		const { school_id, class_id } = req.params;
		const student_id = req.user.user_id;

		console.log('Get Own Scores Request:', {
			school_id,
			class_id,
			student_id,
		});

		const studentScores = await getStudentOwnScores(
			school_id,
			class_id,
			student_id
		);

		sendResponse(res, 200, {
			message: 'Student scores retrieved successfully',
			data: studentScores,
		});
	} catch (error: any) {
		console.error('Get Own Scores Error:', error.message, {
			params: req.params,
			errorDetails: error,
		});
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

export const getStudentSubjectsAndScoresHandler = async (
	req: AuthRequest,
	res: Response
) => {
	try {
		const { school_id, student_id } = req.params;
		const subjectsAndScores = await getStudentSubjectsAndScores(
			school_id,
			student_id
		);

		sendResponse(res, 200, {
			message: 'Student subjects and scores retrieved successfully',
			data: subjectsAndScores,
		});
	} catch (error: any) {
		console.error('Get Subjects and Scores Error:', error.message, {
			params: req.params,
			errorDetails: error,
		});
		sendResponse(res, error.statusCode || 500, {
			message: error.message || 'Internal server error',
		});
	}
};

export const getStudentsBySession = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id, session_id } = req.params;

		if (!school_id || !session_id) {
			throw new AppError('school_id and session_id are required', 400);
		}

		const students = await getStudentsInSession(school_id, session_id);

		sendResponse(res, 200, {
			message: 'Student subjects and scores retrieved successfully',
			data: students,
			count: students.length,
		});
	} catch (error: any) {
		console.error('getStudentsBySession:', error);
		next(new AppError(error.message, error.statusCode || 500));
	}
};

export const getStudentsWithResultsHandler = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { school_id, class_id } = req.params;
		const { session_id, term_id } = req.query;

		if (!school_id || !session_id || !term_id || !class_id) {
			throw new AppError(
				'school_id, session_id, term_id, and class_id are required',
				400
			);
		}

		const students = await getStudentsWithResults(
			school_id,
			session_id as string,
			term_id as string,
			class_id as string
		);

		sendResponse(res, 200, {
			message: 'Student subjects and scores retrieved successfully',
			data: students,
			count: students.length,
		});
	} catch (error: any) {
		console.error('getStudentsWithResults error:', error);
		next(new AppError(error.message, error.statusCode || 500));
	}
};
