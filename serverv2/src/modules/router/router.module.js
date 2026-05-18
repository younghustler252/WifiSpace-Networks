// presentation/modules/router.module.js
import { RouterRepositoryMongo } from "./infrastructure/repositories/router.repository.mongo.js";
import { MikrotikService } from "./services/mikrotik.service.js";
import { AuditService } from "../../shared/services/audit.service.js";
import { AuditRepositoryMongo } from "../audit/infrastructure/repositories/audit.repository.mongo.js";

// Account Use Cases
import { CreateRouterAccount } from "./usecases/account/create-router-account.js";
import { SuspendNetworkAccount } from "./usecases/account/suspend-network-account.js";
import { ResumeNetworkAccount } from "./usecases/account/resume-network.js";
import { CheckRouterStatus } from "./usecases/account/check-router-status.js";
import { RebootRouter } from "./usecases/account/reboot-router.js";

// Admin Use Cases
import { CreateRouter } from "./usecases/admin/create-router.js";
import { UpdateRouter } from "./usecases/admin/update-router.js";
import { DeleteRouter } from "./usecases/admin/delete-router.js";
import { ListRouters } from "./usecases/admin/list-routers.js";

// Controllers & Routes
import { RouterController } from "./presentation/controller/router.controller.js";
import { AdminRouterController } from "./presentation/controller/admin.controller.js";
import routerRoutes from "./presentation/routes/router.routes.js";
import adminRouterRoutes from "./presentation/routes/admin-router.routes.js";

export function RouterModule({ accountRepository, permissionService, userRepository }) {
	// -----------------------------
	// REPOSITORIES & SERVICES
	// -----------------------------
	const auditRepository = new AuditRepositoryMongo();
	const routerRepository = new RouterRepositoryMongo();
	const mikrotikService = new MikrotikService();
	const auditService = new AuditService(auditRepository);

	// -----------------------------
	// ACCOUNT USE CASES
	// -----------------------------
	const createRouterAccount = new CreateRouterAccount({
		accountRepository,
		routerRepository,
		mikrotikService,
		auditService
	});

	const suspendNetworkAccount = new SuspendNetworkAccount({
		accountRepository,
		routerRepository,
		mikrotikService,
		auditService
	});

	const resumeNetworkAccount = new ResumeNetworkAccount({
		accountRepository,
		routerRepository,
		mikrotikService,
		auditService
	});

	const checkRouterStatus = new CheckRouterStatus({
		routerRepository,
		mikrotikService
	});

	const rebootRouter = new RebootRouter({
		routerRepository,
		mikrotikService,
		auditService
	});

	// -----------------------------
	// ADMIN USE CASES
	// -----------------------------
	const createRouter = new CreateRouter(routerRepository, auditService);
	const updateRouter = new UpdateRouter(routerRepository, auditService);
	const deleteRouter = new DeleteRouter(routerRepository, auditService);
	const listRouters = new ListRouters(routerRepository);

	// -----------------------------
	// CONTROLLERS
	// -----------------------------
	const routerController = new RouterController({
		createRouterAccount,
		suspendNetworkAccount,
		resumeNetworkAccount,
		checkRouterStatus,
		rebootRouter
	});

	const adminRouterController = new AdminRouterController({
		createRouter,
		updateRouter,
		deleteRouter,
		listRouters
	});

	// -----------------------------
	// ROUTES
	// -----------------------------
	const routes = routerRoutes({
		routerController,
		permissionService,
		userRepository
	});

	const adminRoutes = adminRouterRoutes({
		adminRouterController,
		permissionService,
        userRepository
	});

	return { routes, adminRoutes };
}