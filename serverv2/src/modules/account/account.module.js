// account.module.js

import { AccountRepositoryMongo } from "./infrastructure/repositories/account.repository.mongo.js";
import { UserRepositoryMongo } from "../user/infrastructure/repositories/user.repository.mongo.js";
import { AuditRepositoryMongo } from "../audit/infrastructure/repositories/audit.repository.mongo.js";

import TrackAnalytics from "../analytics/usecases/track-analytics.js";
import AnalyticsRepositoryMongo from "../analytics/infrastructure/repositories/analytics.repository.mongo.js";

import { PermissionService } from "../../shared/services/permission.service.js";
import { AuditService } from "../../shared/services/audit.service.js";


// Admin usecases
import {
	CreateAccount,
	UpdateAccount,
	DeleteAccount,
	ActivateAccount,
	SuspendAccount,
	TransferAccount,
	GetAllAccounts
} from "./usecases/admin/index.js";

// Self usecases
import {
	GetUserAccounts,
	RequestAccount,
	UpdateUserAccount
} from "./usecases/user/index.js";

// Shared usecases
import { GetAccountById } from "./usecases/shared/get-account-by-Id.js";
import { GetAccountByWsnId } from "./usecases/shared/get-account-by-wsn.js";

// Controllers
import { AdminAccountController } from "./presentation/controllers/admin.controller.js";
import { UserAccountController } from "./presentation/controllers/user.controller.js";
import { SharedAccountController } from "./presentation/controllers/shared.controller.js";

// Routes
import accountRoutes from "./presentation/routes/account.routes.js";

// ----------------------------
// Module Factory
// ----------------------------
export function accountModule({ userRepository: externalUserRepo, permissionService: externalPermissionService } = {}) {

  // Repositories
  const userRepository = externalUserRepo || new UserRepositoryMongo();
  const accountRepository = new AccountRepositoryMongo();
  const auditRepository = new AuditRepositoryMongo();
  const auditService = new AuditService(auditRepository);
  const analyticsRepository = new AnalyticsRepositoryMongo();

	const analyticsTracker = new TrackAnalytics(analyticsRepository);

  // Services
  const permissionService = externalPermissionService || new PermissionService(userRepository);
	console.log('permissionService:', permissionService);
  // ----------------------------
  // UseCases
  // ----------------------------
  const adminUsecases = {
    createAccount: new CreateAccount(accountRepository, permissionService, auditService, analyticsTracker),
    updateAccount: new UpdateAccount(accountRepository, permissionService, auditService),
    deleteAccount: new DeleteAccount(accountRepository, permissionService, auditService),
    activateAccount: new ActivateAccount(accountRepository, permissionService),
    suspendAccount: new SuspendAccount(accountRepository, permissionService),
    transferAccount: new TransferAccount(accountRepository, permissionService, auditService),
    getAllAccounts: new GetAllAccounts(accountRepository, permissionService, auditService)
  };

  const selfUsecases = {
    getUserAccounts: new GetUserAccounts(accountRepository),
    requestAccount: new RequestAccount(accountRepository, auditService),
    updateUserAccount: new UpdateUserAccount(accountRepository, auditService)
  };

  const sharedUsecases = {
    getAccountById: new GetAccountById(accountRepository),
    getAccountByWsnId: new GetAccountByWsnId(accountRepository)
  };

  // ----------------------------
  // Controllers
  // ----------------------------
  const adminAccountController = new AdminAccountController(adminUsecases);
  const userAccountController = new UserAccountController(selfUsecases);
  const sharedAccountController = new SharedAccountController(sharedUsecases);

  // ----------------------------
  // Routes
  // ----------------------------
  const routes = accountRoutes({
    adminAccountController,
    userAccountController,
    sharedAccountController,
    permissionService,
    userRepository
  });

  return { routes };
}