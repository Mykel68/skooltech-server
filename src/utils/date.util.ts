export const addMinutes = (date: Date, mins: number): Date =>
	new Date(date.getTime() + mins * 60_000);
