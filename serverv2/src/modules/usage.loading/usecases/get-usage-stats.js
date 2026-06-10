// modules/usage/usecases/get-usage-stats.usecase.js

import { UsageSummaryRepositoryMongo } from "../infrastructure/repositories/usage-summary.repository.mongo.js";

export class GetUsageStatsUseCase {
	constructor({ summaryRepo = new UsageSummaryRepositoryMongo() } = {}) {
		this.summaryRepo = summaryRepo;
	}

	/**
	 * Fetch usage statistics
	 * @param {Object} options
	 * @param {string} options.accountId - optional filter by account
	 * @param {string} options.subscriptionId - optional filter by subscription
	 * @param {string} options.routerId - optional filter by router
	 * @param {"daily"|"weekly"|"monthly"} options.periodType
	 * @param {string} options.start - optional ISO date filter start
	 * @param {string} options.end - optional ISO date filter end
	 * @returns {Promise<Array>} - array of UsageSummary entities
	 */
	async execute({
		accountId = null,
		subscriptionId = null,
		routerId = null,
		periodType = "daily",
		start = null,
		end = null
	} = {}) {

		const filters = { periodType };

		if (accountId) filters.accountId = accountId;
		if (subscriptionId) filters.subscriptionId = subscriptionId;
		if (routerId) filters.routerId = routerId;
		if (start) filters.period = { $gte: start };
		if (end) {
			filters.period = filters.period
				? { ...filters.period, $lte: end }
				: { $lte: end };
		}

		const summaries = await this.summaryRepo.find(filters);

		// Optionally, you can sort by period ascending
		summaries.sort((a, b) => a.period.localeCompare(b.period));

		return summaries;
	}
}