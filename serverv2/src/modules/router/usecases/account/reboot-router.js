// src/application/use-cases/RebootRouter.js
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class RebootRouter {
    constructor(routerRepository, mikrotikService, auditService) {
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(routerId, currentUser) {
        const router = await this.routerRepository.findById(routerId);
        if (!router) throw new ValidationError("Router not found");

        try {
            // Execute the raw reboot command over the API connection
            // Warning: This will drop the connection immediately as the router shuts down
            await this.mikrotikService.executeReboot(router);

            // Force status to offline in your database since it's power-cycling
            router.status = "offline";
            router.lastError = "Manual reboot initiated by administrator";
            await this.routerRepository.update(router);

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