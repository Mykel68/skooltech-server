import { AppError } from './error.util';

export function resolveSessionAndTerm(
	body: any,
	req: any
): { session_id: string; term_id: string } {
	const session_id = body.session_id || req.session_id;
	const term_id = body.term_id || req.term_id;

	if (!session_id || !term_id) {
		throw new AppError(
			'Session and Term must be provided or there must be an active one',
			400
		);
	}

	return { session_id, term_id };
}
