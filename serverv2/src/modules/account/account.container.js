import { asClass } from "awilix";

/*
|--------------------------------------------------------------------------
| REPOSITORY
|--------------------------------------------------------------------------
*/
import { AccountRepositoryMongo } from "./infrastructure/repositories/account.repository.mongo.js";

/*
|--------------------------------------------------------------------------
| CONTROLLERS
|--------------------------------------------------------------------------
*/
import { AdminAccountController } from "./presentation/controllers/admin.controller.js";
import { UserAccountController } from "./presentation/controllers/user.controller.js";
import { SharedAccountController } from "./presentation/controllers/shared.controller.js";

/*
|--------------------------------------------------------------------------
| USE CASES
|--------------------------------------------------------------------------
*/

// ADMIN
import { CreateAccount } from "./usecases/admin/create-account.js";
import { UpdateAccount } from "./usecases/admin/update-account.js";
import { DeleteAccount } from "./usecases/admin/delete-account.js";
import { ActivateAccount } from "./usecases/admin/activate-account.js";
import { SuspendAccount } from "./usecases/admin/suspend-account.js";
import { TransferAccount } from "./usecases/admin/transfer-account.js";
import { GetAllAccounts } from "./usecases/admin/get-all-accounts.usecase.js";
import { ChangeAccountPassword } from "./usecases/admin/change-account-password.js";

// USER
import { GetUserAccounts } from "./usecases/user/get-user-accounts.js";
import { RequestAccount } from "./usecases/user/request-account.js";
import { UpdateUserAccount } from "./usecases/user/update-user-account.usecase.js";

// SHARED
import { GetAccountById } from "./usecases/shared/get-account-by-Id.js";
import { GetAccountByWsnId } from "./usecases/shared/get-account-by-wsn.js";

/*
|--------------------------------------------------------------------------
| MODULE REGISTRATION
|--------------------------------------------------------------------------
*/
export function registerAccount(container) {

	container.register({

		/*
		|--------------------------------------------------------------------------
		| REPOSITORY
		|--------------------------------------------------------------------------
		*/
		accountRepository: asClass(AccountRepositoryMongo).singleton(),

		/*
		|--------------------------------------------------------------------------
		| ADMIN USE CASES
		|--------------------------------------------------------------------------
		*/
		createAccount: asClass(CreateAccount).scoped(),
		updateAccount: asClass(UpdateAccount).scoped(),
		deleteAccount: asClass(DeleteAccount).scoped(),
		activateAccount: asClass(ActivateAccount).scoped(),
		suspendAccount: asClass(SuspendAccount).scoped(),
		transferAccount: asClass(TransferAccount).scoped(),
		getAllAccounts: asClass(GetAllAccounts).scoped(),
		changeAccountPassword: asClass(ChangeAccountPassword).scoped(),
		/*
		|--------------------------------------------------------------------------
		| USER USE CASES
		|--------------------------------------------------------------------------
		*/
		getUserAccounts: asClass(GetUserAccounts).scoped(),
		requestAccount: asClass(RequestAccount).scoped(),
		updateUserAccount: asClass(UpdateUserAccount).scoped(),

		/*
		|--------------------------------------------------------------------------
		| SHARED USE CASES
		|--------------------------------------------------------------------------
		*/
		getAccountById: asClass(GetAccountById).scoped(),
		getAccountByWsnId: asClass(GetAccountByWsnId).scoped(),

		/*
		|--------------------------------------------------------------------------
		| CONTROLLERS
		|--------------------------------------------------------------------------
		*/
		adminAccountController:
			asClass(AdminAccountController).scoped(),

		userAccountController:
			asClass(UserAccountController).scoped(),

		sharedAccountController:
			asClass(SharedAccountController).scoped()
	});
}