import { asClass } from "awilix";
import { AuditRepositoryMongo } from "./repositories/audit.repository.mongo.js";
import { AuditService } from "./services/audit.service.js";
import { GetMyAuditLogs } from "./usecases/get-my-audit-logs.usecase.js";
import { GetAuditLogs } from "./usecases/get-audit-logs.usecase.js";
import { AuditController } from "./controllers/audit.controller.js";

export function registerAudit(container) {
	container.register({
		auditRepository: asClass(AuditRepositoryMongo).singleton(),
        auditService: asClass(AuditService).scoped(),
		getMyAuditLogs: asClass(GetMyAuditLogs).scoped(),
		getAuditLogs: asClass(GetAuditLogs).scoped(),
		auditController: asClass(AuditController).scoped()
	});
}