export const calculateWeekdays = (start: Date, end: Date): number => {
	let count = 0;
	const cur = new Date(start);

	while (cur <= end) {
		const day = cur.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
		if (day >= 1 && day <= 5) count++;
		cur.setDate(cur.getDate() + 1);
	}

	return count;
};
