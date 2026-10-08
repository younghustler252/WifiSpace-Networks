import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";
import { classifyRouterError } from "../../../../infrastructure/networking/mikrotik/mikrotik.error.js";

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
			const { type, message } = classifyRouterError(error);

			console.error(`[SyncRouterInfo] ${router.host}:`, {
				name: error?.name,
				message,
				errorType: type,
				code: error?.code,
				errno: error?.errno,
				error
			});

			router.markOffline(message, type);
			return this.routerRepository.update(router.id, router);
		}
	}
}
