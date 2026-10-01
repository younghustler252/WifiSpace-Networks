// usecases/admin/get-audit-logs.usecase.js
export class GetAuditLogs {
	constructor({ auditRepository }) {
		this.auditRepository = auditRepository;
	}

	async execute({ actorId, entity, entityId, action, from, to, page = 1, limit = 20 } = {}) {
		const filter = {};
		if (actorId) filter.actorId = actorId;
		if (entity) filter.entity = entity;
		if (entityId) filter.entityId = entityId;
		if (action) filter.action = action;

		if (from || to) {
			filter.createdAt = {};
			if (from) filter.createdAt.$gte = new Date(from);
			if (to) filter.createdAt.$lte = new Date(to);
		}

		return this.auditRepository.paginate({ filter, page, limit, sort: { createdAt: -1 } });
	}
}