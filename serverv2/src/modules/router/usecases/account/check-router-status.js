import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CheckRouterStatus {
	constructor({ routerRepository, routerService }) { // CHANGED: mikrotikService -> routerService
		this.routerRepository = routerRepository;
		this.routerService = routerService;
	}

	async execute(routerId) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new ValidationError("Router not found");

		try {
			
			const systemHealth = await this.routerService.getSystemInfo(router);

			router.status = "online";
			router.lastError = null;
			router.lastSeenAt = new Date();
			router.routerOsVersion = systemHealth.version;
			router.routerBoard = systemHealth.board;

			
			return await this.routerRepository.update(router.id, router);
		} catch (error) {
			router.status = "offline";
			router.lastError = error.message;
			await this.routerRepository.update(router.id, router); // CHANGED: same fix
			return router;
		}
	}
}