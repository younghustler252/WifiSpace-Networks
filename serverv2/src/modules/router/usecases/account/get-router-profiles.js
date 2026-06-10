import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetRouterProfiles {
	constructor({
		routerRepository,
		mikrotikService,
	}) {
		this.routerRepository = routerRepository;
		this.mikrotikService = mikrotikService;
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
			throw new ValidationError("Router is disabled");
		}

		if (!router.apiEnabled) {
			throw new ValidationError(
				"Router API is disabled"
			);
		}

		const profiles =
			await this.mikrotikService.fetchRouterProfiles(
				router,
				serviceType ||
					router.serviceType ||
					"pppoe"
			);

		return profiles;
	}
}