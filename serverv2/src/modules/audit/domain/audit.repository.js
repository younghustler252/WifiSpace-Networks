// src/modules/audit/domain/audit.repository.js
export class AuditRepository {
	/**
	 * Persist an audit log
	 * @param {Object} logData
	 * @returns {Promise<Object>} created audit record
	 */
	async create(logData) {
		throw new Error("Not implemented");
	}

	/**
	 * Fetch audit logs (optional for admin/reporting)
	 * @param {Object} filter
	 * @param {number} skip
	 * @param {number} limit
	 */
	async find(filter = {}, skip = 0, limit = 50) {
		throw new Error("Not implemented");
	}
}