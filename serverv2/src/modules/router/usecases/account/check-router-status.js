// src/application/use-cases/CheckRouterStatus.js
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CheckRouterStatus {
    constructor(routerRepository, mikrotikService) {
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService; // Ensure this has health/resource methods
    }

    async execute(routerId) {
        const router = await this.routerRepository.findById(routerId);
        if (!router) throw new ValidationError("Router not found");

        try {
            // Ask the lower-level API to fetch system resource data
            // e.g., executing [ /system/resource/print ] or [ /system/identity/print ]
            const systemHealth = await this.mikrotikService.getSystemResources(router);

            // Update database tracking metrics with live data
            router.status = "online";
            router.lastError = null;
            router.lastSeenAt = new Date();
            router.routerOsVersion = systemHealth.version;
            router.routerBoard = systemHealth.boardName;
            
            return await this.routerRepository.update(router);
        } catch (error) {
            // If the socket connection drops or times out, mark it offline safely
            router.status = "offline";
            router.lastError = error.message;
            await this.routerRepository.update(router);
            
            return router;
        }
    }
}