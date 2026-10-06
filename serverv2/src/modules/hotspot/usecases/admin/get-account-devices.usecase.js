// hotspot/usecases/admin/get-account-devices.usecase.js — "what devices, current state"
export class GetAccountDevices {
	constructor({ hotspotSessionRepository }) { this.hotspotSessionRepository = hotspotSessionRepository; }
	async execute({ accountId, userId }) {
		const filter = {};
		if (accountId) filter.accountId = accountId;
		if (userId) filter.userId = userId;
		return this.hotspotSessionRepository.paginate({ filter, limit: 100, sort: { lastSeenAt: -1 } });
	}
}