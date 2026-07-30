import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetRouterProfiles {
	constructor({
		routerRepository,
		mikrotikManager,
	}) {
		this.routerRepository = routerRepository;
		this.mikrotikManager = mikrotikManager;
	}


	async execute(routerId, serviceType) {

		const router = routerId
			? await this.routerRepository.findById(routerId)
			: await this.routerRepository.findDefaultRouter();


		if (!router) {
			throw new ValidationError(
				routerId
					? "Router not found"
					: "Default router not found"
			);
		}


		if (!router.isEnabled) {
			throw new ValidationError(
				"Router is disabled"
			);
		}


		if (!router.apiEnabled) {
			throw new ValidationError(
				"Router API is disabled"
			);
		}


		return this.mikrotikManager.getProfiles(
			router,
			serviceType ||
				router.serviceType ||
				"pppoe"
		);
	}
}