import { asClass } from "awilix";

// ==============================
// REPOSITORY
// ==============================
import { MongoUsageRepository } from "../usage/infrastructure/repositories/usage.repository.mongo.js";

// ==============================
// USECASES
// ==============================
import { SyncUsageUseCase } from "../usage/usecases/sync-usage.js";
import { GetUsageUseCase } from "../usage/usecases/get-usage.js";
import { GetAllUsageUseCase } from "../usage/usecases/get-all-usage.js";
// import Getusag


// ==============================
// CONTROLLER
// ==============================
import { UsageController } from "./presentation/controllers/usage.controller.js";

export function registerUsage(container) {
    container.register({

        // ==========================
        // REPOSITORY
        // ==========================
        usageRepository: asClass(MongoUsageRepository).singleton(),

        // ==========================
        // USECASES
        // ==========================
        syncUsage: asClass(SyncUsageUseCase).scoped(),
        getUsage: asClass(GetUsageUseCase).scoped(),
        getAllUsages: asClass(GetAllUsageUseCase).scoped(),

        // ==========================
        // CONTROLLER
        // ==========================
        usageController: asClass(UsageController).scoped()
    });
}