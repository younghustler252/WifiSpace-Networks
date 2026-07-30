export class SyncRouterInfo {
	constructor({ routerService, routerRepository }) { // CHANGED: mikrotikService -> routerService
		this.routerService = routerService;
		this.routerRepository = routerRepository;
	}

	async execute(routerId) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) {
			throw new Error("Router not found");
		}

		try {
			
			const info = await this.routerService.getSystemInfo(router);

			return await this.routerRepository.update(router.id, {
				systemIdentity: info.identity,
				routerOsVersion: info.version,
				routerBoard: info.board,

				status: "online",
				lastError: null,
				lastSeenAt: new Date()
			});

		} catch (error) {
			console.error(error);
			return await this.routerRepository.update(router.id, {
				status: "offline",
				lastError: error.message
			});
		}
	}
}