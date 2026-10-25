import { RESOURCE_TYPES, SYNC_STATUSES } from "../../domain/network-config.enum.js";

export class GetNetworkConfigStatus {
	constructor({ routerRepository, networkConfigRepository }) {
		this.routerRepository = routerRepository;
		this.networkConfigRepository = networkConfigRepository;
	}

	async execute() {
		const [{ data: routers }, states, profilesChangedAt, entriesChangedAt] = await Promise.all([
			this.routerRepository.paginate({ filter: { isEnabled: true }, limit: 100 }),
			this.networkConfigRepository.listSyncStates(),
			this.networkConfigRepository.latestChangeAt(RESOURCE_TYPES.HOTSPOT_PROFILE),
			this.networkConfigRepository.latestChangeAt(RESOURCE_TYPES.WALLED_GARDEN)
		]);

		const present = (routerId, type, changedAt) => {
			const state = states.find((item) => String(item.routerId) === routerId && item.resourceType === type);
			if (!state) return { status: SYNC_STATUSES.NEVER, outOfDate: Boolean(changedAt), lastRunAt: null, lastSuccessAt: null, error: null, counts: {}, failures: [] };

			return {
				status: state.status,
				outOfDate: Boolean(changedAt) && (!state.lastSuccessAt || state.lastSuccessAt < changedAt),
				lastRunAt: state.lastRunAt,
				lastSuccessAt: state.lastSuccessAt,
				error: state.error,
				counts: state.counts,
				failures: state.failures
			};
		};

		return {
			routers: routers
				.filter((router) => router.supports?.("hotspot"))
				.map((router) => ({
					id: router.id,
					name: router.name,
					code: router.code,
					status: router.status,
					profiles: present(router.id, RESOURCE_TYPES.HOTSPOT_PROFILE, profilesChangedAt),
					walledGarden: present(router.id, RESOURCE_TYPES.WALLED_GARDEN, entriesChangedAt)
				}))
		};
	}
}
