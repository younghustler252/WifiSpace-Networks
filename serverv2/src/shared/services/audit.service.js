// src/shared/services/audit.service.js
export class AuditService {
	/**
	 * @param {AuditRepository} auditRepository
	 */
	constructor(auditRepository) {
		this.auditRepository = auditRepository;
	}

	/**
	 * Log an audit event
	 * @param {Object} params
	 * @param {string} params.actorId - user performing the action
	 * @param {string} params.action - action name, e.g. LOGIN_SUCCESS
	 * @param {string} [params.targetId] - affected user/resource
	 * @param {string} [params.resource] - e.g. "User"
	 * @param {Object} [params.metadata] - extra info
	 * @param {string} [params.ip]
	 * @param {string} [params.userAgent]
	 */
	async log({ actorId, action, targetId = null, resource = null, metadata = {}, ip = null, userAgent = null }) {
		return this.auditRepository.create({
			actorId,
			targetId,
			action,
			resource,
			metadata,
			ip,
			userAgent
		});
	}

	/**
	 * Fetch audit logs for admin/reporting
	 * @param {Object} filter
	 * @param {number} skip
	 * @param {number} limit
	 */
	async fetchLogs(filter = {}, skip = 0, limit = 50) {
		return this.auditRepository.find(filter, skip, limit);
	}
}