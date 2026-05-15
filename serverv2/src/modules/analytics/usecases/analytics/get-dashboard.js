export default class GetDashboard {
	constructor(analyticsRepo) {
		this.analyticsRepo = analyticsRepo;
	}

	async execute() {
	const overview = await this.analyticsRepo.getOverview();

	const totals = overview.last7Days.reduce(
		(acc, d) => {
			acc.revenue += d.totalRevenue || 0;
			acc.payments += d.totalPayments || 0;
			return acc;
		},
		{ revenue: 0, payments: 0 }
	);

	return {
		metrics: totals,
		trends: overview.last7Days
	};
}
}