export const countWeekdays = (start: Date, end: Date): number => {
	let count = 0;
	const cur = new Date(start);
	while (cur <= end) {
		const day = cur.getDay();
		if (day !== 0 && day !== 6) count++;
		cur.setDate(cur.getDate() + 1);
	}
	return count;
};
