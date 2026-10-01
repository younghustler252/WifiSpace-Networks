import { asClass } from "awilix";

import { UserRepositoryMongo } from "./repositories/user.repository.mongo.js";
import { GetMyProfile } from "./usecases/user/get-my-profile.usecase.js";
import { UpdateMyProfile } from "./usecases/user/update-my-profile.usecase.js";
import { ChangePassword } from "./usecases/user/change-password.usecase.js";
import { UploadAvatar } from "./usecases/user/upload-avatar.usecase.js";

import { CreateUser } from "./usecases/admin/create-user.usecase.js";
import { GetAllUsers } from "./usecases/admin/get-all-users.usecase.js";
import { GetUserById } from "./usecases/admin/get-user-by-id.usecase.js";
import { AdminUpdateUserProfile } from "./usecases/admin/admin-update-user-profile.usecase.js";
import { UpdateRole } from "./usecases/admin/update-role.usecase.js";
import { BanUser } from "./usecases/admin/ban-user.usecase.js";
import { UnbanUser } from "./usecases/admin/unban-user.usecase.js";
import { DeleteUser } from "./usecases/admin/delete-user.usecase.js";
import { AdminSetUserPassword } from "./usecases/admin/admin-set-user-password.usecase.js";
import { ImpersonateUser } from "./usecases/admin/impersonate-user.usecase.js";

import { UserController } from "./controllers/user.controller.js";
import { AdminController } from "./controllers/admin.controller.js";

export function registerUser(container) {
	container.register({
		getMyProfile: asClass(GetMyProfile).scoped(),
		updateMyProfile: asClass(UpdateMyProfile).scoped(),
		changePassword: asClass(ChangePassword).scoped(),
		uploadAvatar: asClass(UploadAvatar).scoped(),

		createUser: asClass(CreateUser).scoped(),
		getAllUsers: asClass(GetAllUsers).scoped(),
		getUserById: asClass(GetUserById).scoped(),
		adminUpdateUserProfile: asClass(AdminUpdateUserProfile).scoped(),
		updateRole: asClass(UpdateRole).scoped(),
		banUser: asClass(BanUser).scoped(),
		unbanUser: asClass(UnbanUser).scoped(),
		deleteUser: asClass(DeleteUser).scoped(),
		adminSetUserPassword: asClass(AdminSetUserPassword).scoped(),
		impersonateUser: asClass(ImpersonateUser).scoped(),

		userRepository: asClass(UserRepositoryMongo).singleton(),
		userController: asClass(UserController).scoped(),
		userAdminController: asClass(AdminController).scoped()
	});
}