import { asClass } from "awilix";

import { AccountRepositoryMongo } from "./repositories/account.repository.mongo.js";

import { GetMyAccount } from "./usecases/user/get-my-account.usecase.js";
import { GetMyAccounts } from "./usecases/user/get-my-accounts.usecase.js";
import { RequestAccount } from "./usecases/user/request-account.usecase.js";
import { AddDevice } from "./usecases/user/add-device.usecase.js";
import { RemoveDevice } from "./usecases/user/remove-device.usecase.js";

import { GetAccountById } from "./usecases/admin/get-account-by-id.usecase.js";
import { GetAllAccounts } from "./usecases/admin/get-all-accounts.usecase.js";
import { CreateAccount } from "./usecases/admin/create-account.usecase.js";
import { ApproveAccount } from "./usecases/admin/approve-account.usecase.js";
import { RejectAccount } from "./usecases/admin/reject-account.usecase.js";
import { SuspendAccount } from "./usecases/admin/suspend-account.usecase.js";
import { PauseAccount } from "./usecases/admin/pause-account.usecase.js";
import { ResumeAccount } from "./usecases/admin/resume-account.usecase.js";
import { TerminateAccount } from "./usecases/admin/terminate-account.usecase.js";
import { TransferAccount } from "./usecases/admin/transfer-account.usecase.js";
import { DeleteAccount } from "./usecases/admin/delete-account.usecase.js";

import { AccountController } from "./controllers/account.controller.js";
import { AdminController } from "./controllers/admin.controller.js";

export function registerAccount(container) {
	container.register({
		accountRepository: asClass(AccountRepositoryMongo).singleton(),

		getMyAccount: asClass(GetMyAccount).scoped(),
		getMyAccounts: asClass(GetMyAccounts).scoped(),
		requestAccount: asClass(RequestAccount).scoped(),
		addDevice: asClass(AddDevice).scoped(),
		removeDevice: asClass(RemoveDevice).scoped(),

		getAccountById: asClass(GetAccountById).scoped(),
		getAllAccounts: asClass(GetAllAccounts).scoped(),
		createAccount: asClass(CreateAccount).scoped(),
		approveAccount: asClass(ApproveAccount).scoped(),
		rejectAccount: asClass(RejectAccount).scoped(),
		suspendAccount: asClass(SuspendAccount).scoped(),
		pauseAccount: asClass(PauseAccount).scoped(),
		resumeAccount: asClass(ResumeAccount).scoped(),
		terminateAccount: asClass(TerminateAccount).scoped(),
		transferAccount: asClass(TransferAccount).scoped(),
		deleteAccount: asClass(DeleteAccount).scoped(),

		accountController: asClass(AccountController).scoped(),
		accountAdminController: asClass(AdminController).scoped()
	});
}