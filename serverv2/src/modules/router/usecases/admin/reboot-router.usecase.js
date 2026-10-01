import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";

export class RebootRouter {
	constructor({ routerRepository, routerService, auditService }) {
		this.routerRepository = routerRepository;
		this.routerService = routerService;
		this.auditService = auditService;
	}

	async execute({ actorId, routerId, ip = null }) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);
		if (!router.isOnline()) throw new ValidationError("Cannot reboot a router that is offline", ROUTER_ERROR_CODES.ROUTER_OFFLINE);

		await this.routerService.reboot(router);

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "ROUTER_REBOOTED", entity: "Router", entityId: router.id, ip });
		}

		return { message: "Reboot command sent successfully" };
	}
}