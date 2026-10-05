// router/usecases/admin/update-router.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";

const UPDATABLE_FIELDS = ["name", "host", "port", "username", "password", "supportedServices", "location", "siteCode", "popName", "connectionType", "priority", "isDefaultRouter", "isEnabled", "apiEnabled", "maxSessions"];

export class UpdateRouter {
	constructor({ routerRepository, auditService }) {
		this.routerRepository = routerRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, routerId, data, ip = null }) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);

		const patch = {};
		for (const field of UPDATABLE_FIELDS) {
			if (data[field] !== undefined) patch[field] = data[field];
		}

		const updated = await this.routerRepository.update(routerId, { ...router, ...patch });

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "ROUTER_UPDATED", entity: "Router", entityId: routerId, newValue: patch, ip });
		}

		return updated;
	}
}