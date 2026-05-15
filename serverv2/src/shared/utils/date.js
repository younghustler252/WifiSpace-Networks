export const getDayString = (date = new Date()) => {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d.toISOString().split("T")[0]; // "2026-04-17"
};

export const getWeekString = (date = new Date()) => {
	const d = new Date(date);
	const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
	const pastDays = Math.floor((d - firstDayOfYear) / 86400000);
	const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);

	return `${d.getFullYear()}-W${week}`;
};

export const getMonthString = (date = new Date()) => {
	const d = new Date(date);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};