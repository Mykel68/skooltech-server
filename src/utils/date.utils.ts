import { Term } from '../models/term.model';

export const calculateTotalSchoolDaysFromTerm = async (
	term_id: string
): Promise<number> => {
	const term = await Term.findByPk(term_id);
	if (!term || !term.start_date || !term.end_date) {
		throw new Error('Term not found or missing start/end date');
	}

	const start = new Date(term.start_date);
	const end = new Date(term.end_date);
	let count = 0;

	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		const day = d.getDay();
		// Weekdays are Monday to Friday (1 to 5)
		if (day >= 1 && day <= 5) count++;
	}

	return count;
};
