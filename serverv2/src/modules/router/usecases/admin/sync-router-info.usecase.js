import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";

export class SyncRouterInfo {
	constructor({ routerService, routerRepository }) {
		this.routerService = routerService;
		this.routerRepository = routerRepository;
	}

	async execute({ routerId }) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);

		try {
			const info = await this.routerService.getSystemInfo(router);
			router.markOnline({ identity: info.identity, version: info.version, board: info.board });
			return this.routerRepository.update(router.id, router);
		} catch (error) {
			console.error(`[SyncRouterInfo] ${router.host}:`, error.message);
			router.markOffline(error.message);
			return this.routerRepository.update(router.id, router);
		}
	}
}