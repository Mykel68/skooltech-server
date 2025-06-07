import { Request, Response } from 'express';
import * as subjectService from '../services/subject.service';
import { sendResponse } from '../utils/response.util';
import { AppError } from '../utils/error.util';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Create a new subject with session/term handling
 */
export const createSubjectHandler = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { class_id } = req.params;
	const teacher_id = req.user?.user_id;

	const {
		name,
		short,
		session_id: bodySessionId,
		term_id: bodyTermId,
	} = req.body;

	const session_id = bodySessionId || req.session_id;
	const term_id = bodyTermId || req.term_id;

	try {
		if (!class_id || !name) {
			throw new AppError('Class ID and subject name are required', 400);
		}

		if (!session_id || !term_id) {
			throw new AppError(
				'Session and Term are required or must be active',
				400
			);
		}

		const subject = await subjectService.createSubject(
			class_id,
			teacher_id!,
			name,
			short,
			session_id,
			term_id
		);

		sendResponse(res, 201, subject);
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};

/**
 * Approve a subject
 */
export const approveSubjectHandler = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { subject_id } = req.params;

	try {
		if (!subject_id) {
			throw new AppError('Subject ID is required', 400);
		}

		const subject = await subjectService.approveSubject(subject_id);
		sendResponse(res, 200, subject);
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};

/**
 * Get subjects for a class (session + term sensitive)
 */
export const getSubjectsByClassHandler = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { class_id } = req.params;
	const school_id = req.user?.school_id;
	const session_id = req.session_id;
	const term_id = req.term_id;

	try {
		if (!class_id) {
			throw new AppError('Class ID is required', 400);
		}
		if (!session_id || !term_id) {
			throw new AppError('Missing session or term', 400);
		}

		const subjects = await subjectService.getSubjectsByClass(
			school_id!,
			session_id,
			term_id,
			class_id
		);

		sendResponse(res, 200, subjects);
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};

/**
 * Get all subjects for a school (current session + term)
 */
export const getSubjectsOfaSchool = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const school_id = req.user?.school_id;
	const session_id = req.session_id;
	const term_id = req.term_id;

	try {
		const subjects = await subjectService.getSubjectsOfSchool(
			school_id!,
			session_id!,
			term_id!
		);

		sendResponse(res, 200, subjects);
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};

/**
 * Get all subjects of a specific class (student perspective)
 */
export const getSubjectByaStudent = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { class_id } = req.params;
	const school_id = req.user?.school_id;
	const session_id = req.session_id;
	const term_id = req.term_id;

	try {
		const subjects = await subjectService.getSubjectsOfClassByStudent(
			school_id!,
			session_id!,
			term_id!,
			class_id
		);

		sendResponse(res, 200, subjects);
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};

/**
 * Get all subjects of a class for a teacher (session/term scoped)
 */
export const getSubjectsOfaTeacher = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { teacher_id } = req.params;
	const school_id = req.user?.school_id;

	// Use query params if provided, else fallback to req object
	const session_id = (req.query.session_id as string) || req.session_id;
	const term_id = (req.query.term_id as string) || req.term_id;

	try {
		const subjects = await subjectService.getSubjectsOfTeacherFromSchool(
			school_id!,
			session_id!,
			term_id!,
			teacher_id!
		);

		sendResponse(res, 200, subjects);
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};

/**
 * Get a single subject by ID
 */
export const getSubjectByIdHandler = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { subject_id } = req.params;
	const school_id = req.user?.school_id;

	try {
		if (!subject_id) {
			throw new AppError('Subject ID is required', 400);
		}

		const subject = await subjectService.getSubjectById(
			subject_id,
			school_id!
		);
		sendResponse(res, 200, subject);
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};

/**
 * Update a subject
 */
export const updateSubjectHandler = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { subject_id, school_id } = req.params;
	const updates = req.body;

	try {
		if (!subject_id || !school_id) {
			throw new AppError('Subject ID and School ID are required', 400);
		}

		const subject = await subjectService.updateSubject(
			school_id,
			subject_id,
			updates
		);

		sendResponse(res, 200, {
			message: 'Subject updated successfully',
			subject,
		});
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};

/**
 * Delete a subject
 */
export const deleteSubjectHandler = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	const { subject_id, school_id: paramSchoolId } = req.params;
	const userSchoolId = req.user?.school_id;

	try {
		if (!subject_id) {
			throw new AppError('Subject ID is required', 400);
		}
		if (!paramSchoolId || !userSchoolId || paramSchoolId !== userSchoolId) {
			throw new AppError('Invalid or unauthorized school ID', 403);
		}

		await subjectService.deleteSubject(paramSchoolId, subject_id);
		sendResponse(res, 200, { message: 'Subject deleted successfully' });
	} catch (error: any) {
		sendResponse(res, error.statusCode || 500, { message: error.message });
	}
};
