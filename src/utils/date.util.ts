import Term from "../models/term.model";

export const addMinutes = (date: Date, mins: number): Date =>
  new Date(date.getTime() + mins * 60_000);

export const calculateTotalSchoolDaysFromTerm = async (
  term_id: string
): Promise<number> => {
  const term = await Term.findByPk(term_id);
  if (!term || !term.start_date || !term.end_date) {
    throw new Error("Term not found or missing start/end date");
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

export const calculateSchoolDays = (start: Date, end: Date): number => {
  let count = 0;
  let current = new Date(start);

  while (current <= end) {
    const day = current.getDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) count++; // Mon–Fri
    current.setDate(current.getDate() + 1);
  }

  return count;
};
export const getPreviousMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day of last month
  return { start, end };
};
