import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";

export class DeleteRouter {
	constructor({ routerRepository, accountRepository, auditService }) {
		this.routerRepository = routerRepository;
		this.accountRepository = accountRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, routerId, ip = null }) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);

		if (router.currentSessions > 0) {
			throw new ValidationError("Cannot delete a router with active sessions — reassign accounts first");
		}

		await this.routerRepository.update(routerId, { ...router, deletedAt: new Date(), isEnabled: false });

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "ROUTER_DELETED", entity: "Router", entityId: routerId, ip });
		}

		return { message: "Router deleted successfully" };
	}
}