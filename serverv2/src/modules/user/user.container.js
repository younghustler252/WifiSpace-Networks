import { asClass } from "awilix";

/*
|--------------------------------------------------------------------------
| REPOSITORIES
|--------------------------------------------------------------------------
*/
import { UserRepositoryMongo } from "./infrastructure/repositories/user.repository.mongo.js";

/*
|--------------------------------------------------------------------------
| CONTROLLERS
|--------------------------------------------------------------------------
*/
import { SelfController } from "./presentation/controllers/self.controller.js";
import { AdminController } from "./presentation/controllers/admin.controller.js";
import { StaffController } from "./presentation/controllers/staff.controller.js";

/*
|--------------------------------------------------------------------------
| USE CASES
|--------------------------------------------------------------------------
*/

// SELF
import { GetMyProfile } from "./usecases/self/get-my-profile.usecase.js";
import { UpdateMyProfile } from "./usecases/self/update-my-profile.usecase.js";
import { ChangePassword } from "./usecases/self/change-password.usecase.js";
import { UploadAvatar } from "./usecases/self/upload-avatar.usecase.js";

// ADMIN
import { CreateUser } from "./usecases/admin/create-user.usecase.js";
import { UpdateRole } from "./usecases/admin/update-role.usecase.js";
import { DeleteUser } from "./usecases/admin/delete-user.usecase.js";
import { BanUser } from "./usecases/admin/ban-user.usecase.js";
import { UpdateUserProfile } from "./usecases/admin/update-user-profile.js";

// STAFF
import { SearchUser } from "./usecases/staff/search-user.usecase.js";
import { ImpersonateUser } from "./usecases/staff/impersonate-user.usecase.js";

// SHARED
import { GetAllUsers } from "./usecases/shared/get-all-users.usecase.js";
import { GetUserById } from "./usecases/shared/get-user-by-id.usecase.js";

/*
|--------------------------------------------------------------------------
| MODULE REGISTRATION
|--------------------------------------------------------------------------
*/
export function registerUser(container) {

	container.register({

		/*
		|--------------------------------------------------------------------------
		| REPOSITORIES
		|--------------------------------------------------------------------------
		*/
		userRepository: asClass(UserRepositoryMongo).singleton(),

		/*
		|--------------------------------------------------------------------------
		| SELF USE CASES
		|--------------------------------------------------------------------------
		*/
		getMyProfile: asClass(GetMyProfile).scoped(),
		updateMyProfile: asClass(UpdateMyProfile).scoped(),
		changePassword: asClass(ChangePassword).scoped(),
		uploadAvatar: asClass(UploadAvatar).scoped(),

		/*
		|--------------------------------------------------------------------------
		| SHARED USE CASES
		|--------------------------------------------------------------------------
		*/
		getAllUsers: asClass(GetAllUsers).scoped(),
		getUserById: asClass(GetUserById).scoped(),

		/*
		|--------------------------------------------------------------------------
		| STAFF USE CASES
		|--------------------------------------------------------------------------
		*/
		searchUser: asClass(SearchUser).scoped(),
		impersonateUser: asClass(ImpersonateUser).scoped(),

		/*
		|--------------------------------------------------------------------------
		| ADMIN USE CASES
		|--------------------------------------------------------------------------
		*/
		createUser: asClass(CreateUser).scoped(),
		updateRole: asClass(UpdateRole).scoped(),
		updateUserProfile: asClass(UpdateUserProfile).scoped(),
		deleteUser: asClass(DeleteUser).scoped(),
		banUser: asClass(BanUser).scoped(),

		/*
		|--------------------------------------------------------------------------
		| CONTROLLERS
		|--------------------------------------------------------------------------
		*/
		selfController: asClass(SelfController).scoped(),
		staffController: asClass(StaffController).scoped(),
		adminController: asClass(AdminController).scoped()
	});
}