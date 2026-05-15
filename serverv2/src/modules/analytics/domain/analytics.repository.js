export default class AnalyticsRepository {
	// DAILY
	async upsertDaily(date, data) {}
	async getDailyByDate(date) {}
	async getDailyRange(startDate, endDate) {}

	// WEEKLY
	async upsertWeekly(week, data) {}
	async getWeeklyRange(startWeek, endWeek) {}

	// MONTHLY
	async upsertMonthly(month, data) {}
	async getMonthlyRange(startMonth, endMonth) {}

	// DASHBOARD
	async getOverview() {}
}