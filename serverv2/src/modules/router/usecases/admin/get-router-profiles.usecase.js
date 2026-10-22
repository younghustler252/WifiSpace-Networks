import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";

export class GetRouterProfiles {
	constructor({ routerRepository, mikrotikManager }) {
		this.routerRepository = routerRepository;
		this.mikrotikManager = mikrotikManager;
	}

	async execute({ routerId, serviceType, accessMethod = null }) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);
		if (!router.supports(serviceType)) throw new ValidationError(`Router does not support ${serviceType}`);

		return this.mikrotikManager.getProfiles(router, serviceType, accessMethod);
	}
}