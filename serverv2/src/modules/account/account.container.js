import { asClass } from "awilix";

import { AccountRepositoryMongo } from "./repositories/account.repository.mongo.js";

import { AdminAccountController } from "./controllers/admin-account.controller.js";
import { AccountController } from "./controllers/account.controller.js";

import { CreateAccount } from "./usecases/admin/create-account.js";
import { GetAccount } from "./usecases/admin/get-account.js";
import { GetAllAccounts } from "./usecases/admin/get-all-accounts.js";
import { GetAccountStats } from "./usecases/admin/get-account-stats.js";
import { UpdateAccount } from "./usecases/admin/update-account.js";
import { DeleteAccount } from "./usecases/admin/delete-account.js";
import { ApproveAccount } from "./usecases/admin/approve-account.js";
import { RejectAccount } from "./usecases/admin/reject-account.js";
import { SuspendAccount } from "./usecases/admin/suspend-account.js";
import { TransferAccount } from "./usecases/admin/transfer-account.js";
import { ChangeRouterPassword } from "./usecases/admin/change-router-password.js";

import { GetMyAccount } from "./usecases/user/get-my-account.js";
import { GetMyAccounts } from "./usecases/user/get-my-accounts.js";
import { RequestAccount } from "./usecases/user/request-account.js";
import { UpdateMyAccount } from "./usecases/user/update-my-account.js";

import { AccountResolverService } from "./services/account.resolver.js";


export function registerAccount(container) {

	container.register({

		accountRepository:
			asClass(AccountRepositoryMongo).singleton(),


		createAccount:
			asClass(CreateAccount).scoped(),

		getAccount:
			asClass(GetAccount).scoped(),

		getAllAccounts:
			asClass(GetAllAccounts).scoped(),

		getAccountStats:
			asClass(GetAccountStats).scoped(),

		updateAccount:
			asClass(UpdateAccount).scoped(),

		deleteAccount:
			asClass(DeleteAccount).scoped(),

		approveAccount:
			asClass(ApproveAccount).scoped(),

		rejectAccount:
			asClass(RejectAccount).scoped(),

		suspendAccount:
			asClass(SuspendAccount).scoped(),

		transferAccount:
			asClass(TransferAccount).scoped(),

		changeRouterPassword:
			asClass(ChangeRouterPassword).scoped(),


		getMyAccount:
			asClass(GetMyAccount).scoped(),

		getMyAccounts:
			asClass(GetMyAccounts).scoped(),

		requestAccount:
			asClass(RequestAccount).scoped(),

		updateMyAccount:
			asClass(UpdateMyAccount).scoped(),


		adminAccountController:
			asClass(AdminAccountController).scoped(),

		accountController:
			asClass(AccountController).scoped(),


		accountResolver:
			asClass(AccountResolverService).scoped()

	});
}