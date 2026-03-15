export class UsageRepository {

	/**
	 * Save a new Usage entity
	 * @param {Usage} usage
	 */
	async create(usage) {
		throw new Error("Not implemented");
	}

	/**
	 * Update existing usage or create if not exists
	 * @param {Usage} usage
	 */
	async upsert(usage) {
		throw new Error("Not implemented");
	}

	/**
	 * Find active sessions
	 * @returns {Promise<Usage[]>}
	 */
	async findActiveSessions() {
		throw new Error("Not implemented");
	}

	/**
	 * Find usage by sessionId
	 * @param {string} sessionId
	 * @returns {Promise<Usage|null>}
	 */
	async findBySessionId(sessionId) {
		throw new Error("Not implemented");
	}

	/**
	 * Mark session as ended
	 * @param {string} sessionId
	 * @param {Date} endedAt
	 */
	async markSessionEnded(sessionId, endedAt) {
		throw new Error("Not implemented");
	}

	/**
	 * Get usage history for an account
	 * @param {string} accountId
	 * @param {number} limit
	 * @returns {Promise<Usage[]>}
	 */
	async getUserUsage(accountId, limit = 50) {
		throw new Error("Not implemented");
	}

}