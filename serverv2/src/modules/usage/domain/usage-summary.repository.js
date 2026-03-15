// modules/usage/domain/usage-summary.repository.js

export class UsageSummaryRepository {
	/**
	 * Save or update a usage summary
	 * @param {UsageSummary} summary
	 * @returns {Promise<UsageSummary>}
	 */
	async upsert(summary) {
		throw new Error("Not implemented");
	}

	/**
	 * Find usage summary by accountId or subscriptionId and period
	 * @param {Object} query {accountId?, subscriptionId?, periodType, period}
	 * @returns {Promise<UsageSummary|null>}
	 */
	async findOne(query) {
		throw new Error("Not implemented");
	}

	/**
	 * Find multiple summaries by filters
	 * @param {Object} filters
	 * @returns {Promise<UsageSummary[]>}
	 */
	async find(filters = {}) {
		throw new Error("Not implemented");
	}
}