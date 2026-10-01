import crypto from "crypto";
import { ConflictError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";
import { Router } from "../../domain/router.entity.js";

export class CreateRouter {
	constructor({ routerRepository, syncRouterInfo, auditService }) {
		this.routerRepository = routerRepository;
		this.syncRouterInfo = syncRouterInfo;
		this.auditService = auditService;
	}

	async execute({ actorId, name, host, port, username, password, supportedServices = [], isDefaultRouter = false, location = null, ip = null }) {
		const exists = await this.routerRepository.findByHost(host);
		if (exists) throw new ConflictError(`Router with host ${host} already exists`, ROUTER_ERROR_CODES.ROUTER_CODE_CONFLICT);

		const code = `RT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

		const router = new Router({ name, code, host, port, username, password, supportedServices, isDefaultRouter, location });

		const created = await this.routerRepository.create(router);

		if (this.syncRouterInfo) {
			await this.syncRouterInfo.execute({ routerId: created.id }).catch((err) =>
				console.error(`[CreateRouter] Initial sync failed for ${created.host}:`, err.message)
			);
		}

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "ROUTER_CREATED", entity: "Router", entityId: created.id,
				newValue: { host, name, supportedServices, isDefaultRouter }, ip
			});
		}

		return created;
	}
}