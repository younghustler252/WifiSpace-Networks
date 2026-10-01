// usecases/user/get-my-audit-logs.usecase.js
export class GetMyAuditLogs {
	constructor({ auditRepository }) {
		this.auditRepository = auditRepository;
	}

	async execute({ userId, page = 1, limit = 20 }) {
		return this.auditRepository.paginate({
			filter: { actorId: userId },
			page,
			limit,
			sort: { createdAt: -1 }
		});
	}
}