export class SyncAllRouters {
	constructor({ routerRepository, syncRouterInfo }) {
		this.routerRepository = routerRepository;
		this.syncRouterInfo = syncRouterInfo;
	}

	async execute() {
		const { data: routers } = await this.routerRepository.paginate({ filter: { isEnabled: true }, limit: 500 });

		let synced = 0;
		let failed = 0;

		for (const router of routers) {
			try {
				await this.syncRouterInfo.execute({ routerId: router.id });
				synced++;
			} catch (err) {
				console.error(`[SyncAllRouters] ${router.host} failed:`, err.message);
				failed++;
			}
		}

		return { total: routers.length, synced, failed };
	}
}