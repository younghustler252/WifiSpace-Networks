import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class RebootRouter {
	constructor({ routerRepository, routerService, auditService }) { // CHANGED: mikrotikService -> routerService
		this.routerRepository = routerRepository;
		this.routerService = routerService;
		this.auditService = auditService;
	}

	async execute(routerId, currentUser) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new ValidationError("Router not found");

		try {
		
			await this.routerService.reboot(router);

			router.status = "offline";
			router.lastError = "Manual reboot initiated by administrator";

			
			await this.routerRepository.update(router.id, router);

			await this.auditService.log({
				actorId: currentUser.id,
				action: "ROUTER_MANUAL_REBOOT",
				targetId: router.id,
				resource: "Router",
				metadata: { routerCode: router.code, name: router.name }
			});

			return { success: true, message: "Reboot command sent successfully. Router is restarting." };
		} catch (error) {
			throw new Error(`Failed to execute hardware reboot command: ${error.message}`);
		}
	}
}