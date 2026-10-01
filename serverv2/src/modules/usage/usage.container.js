import { asClass } from "awilix";

import { UsageRepositoryMongo } from "./repositories/usage.repository.mongo.js";
import { UsageSummaryRepositoryMongo } from "./repositories/usage-summary.repository.mongo.js";

import { RecordUsage } from "./usecases/system/record-usage.usecase.js";
import { GetMyUsage } from "./usecases/user/get-my-usage.usecase.js";
import { GetUsageStats } from "./usecases/admin/get-usage-stats.usecase.js";
import { GetAllUsage } from "./usecases/admin/get-all-usage.usecase.js";
import { UsageSyncCursorRepositoryMongo } from "./repositories/usage-sync-cursor.repository.mongo.js";
import { SyncUsage } from "./usecases/system/sync-usage.usecase.js";
// ...

import { UsageController } from "./controllers/usage.controller.js";
import { AdminController } from "./controllers/admin.controller.js";

export function registerUsage(container) {
	container.register({
		usageRepository: asClass(UsageRepositoryMongo).singleton(),
		usageSummaryRepository: asClass(UsageSummaryRepositoryMongo).singleton(),

		recordUsage: asClass(RecordUsage).scoped(),
		getMyUsage: asClass(GetMyUsage).scoped(),
		getUsageStats: asClass(GetUsageStats).scoped(),
		getAllUsage: asClass(GetAllUsage).scoped(),
        usageSyncCursorRepository: asClass(UsageSyncCursorRepositoryMongo).singleton(),
        syncUsage: asClass(SyncUsage).scoped(),
        
		usageController: asClass(UsageController).scoped(),
		adminController: asClass(AdminController).scoped()
	});
}