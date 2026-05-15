// src/modules/user/user.module.js

import { UserRepositoryMongo } from "./infrastructure/repositories/user.repository.mongo.js";
import { AuditRepositoryMongo } from "../audit/infrastructure/repositories/audit.repository.mongo.js";

import TrackAnalytics from "../analytics/usecases/track-analytics.js";
import AnalyticsRepositoryMongo from "../analytics/infrastructure/repositories/analytics.repository.mongo.js";



/*
|--------------------------------------------------------------------------
| Services
|--------------------------------------------------------------------------
*/
import { AuditService } from "../../shared/services/audit.service.js";
import { PermissionService } from "../../shared/services/permission.service.js";
import { CloudinaryService } from "../../shared/services/cloudinary.service.js";
import { PasswordService } from "../../shared/services/password.service.js";
/*
|--------------------------------------------------------------------------
| Self UseCases
|--------------------------------------------------------------------------
*/
import { GetMyProfile } from "./usecases/self/get-my-profile.usecase.js";
import { UpdateMyProfile } from "./usecases/self/update-my-profile.usecase.js";
import { ChangePassword } from "./usecases/self/change-password.usecase.js";
import { UploadAvatar } from "./usecases/self/upload-avatar.usecase.js";

/*
|--------------------------------------------------------------------------
| Admin UseCases
|--------------------------------------------------------------------------
*/
import { CreateUser } from "./usecases/admin/create-user.usecase.js";
import { UpdateRole } from "./usecases/admin/update-role.usecase.js";
import { DeleteUser } from "./usecases/admin/delete-user.usecase.js";
import { BanUser } from "./usecases/admin/ban-user.usecase.js";
import { UpdateUserProfile } from "./usecases/admin/update-user-profile.js";

/*
|--------------------------------------------------------------------------
| Staff UseCases
|--------------------------------------------------------------------------
*/
import { SearchUser } from "./usecases/staff/search-user.usecase.js";
import { ImpersonateUser } from "./usecases/staff/impersonate-user.usecase.js";

/*
|--------------------------------------------------------------------------
| Shared UseCases (reusable)
|--------------------------------------------------------------------------
*/
import { GetAllUsers } from "./usecases/shared/get-all-users.usecase.js";
import { GetUserById } from "./usecases/shared/get-user-by-id.usecase.js";

/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/
import { SelfController } from "./presentation/controllers/self.controller.js";
import { AdminController } from "./presentation/controllers/admin.controller.js";
import { StaffController } from "./presentation/controllers/staff.controller.js";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
import userRoutes from "./presentation/routes/user.routes.js";

export function userModule({
	userRepository: externalUserRepo,
	permissionService: externalPermissionService
} = {}) {

	/*
	|--------------------------------------------------------------------------
	| Repositories
	|--------------------------------------------------------------------------
	*/
	const userRepository = externalUserRepo || new UserRepositoryMongo();
	const auditRepository = new AuditRepositoryMongo();
	const analyticsRepository = new AnalyticsRepositoryMongo();

	const analyticsTracker = new TrackAnalytics(analyticsRepository);
	/*
	|--------------------------------------------------------------------------
	| Services
	|--------------------------------------------------------------------------
	*/
	const auditService = new AuditService(auditRepository);
	const cloudinaryService = new CloudinaryService();

	const permissionService =
		externalPermissionService || new PermissionService(userRepository);

	const passwordService = new PasswordService();
	

	// console.log(userRepository);
	

	/*
	|--------------------------------------------------------------------------
	| UseCases
	|--------------------------------------------------------------------------
	*/
	const usecases = {

		/*
		|----------------------------
		| Self
		|----------------------------
		*/
		getMyProfile: new GetMyProfile(userRepository),

		updateMyProfile: new UpdateMyProfile(
			userRepository,
			auditService
		),

		changePassword: new ChangePassword(
			userRepository,
			passwordService,
			auditService
		),

		uploadAvatar: new UploadAvatar(
			userRepository,
			cloudinaryService,
			auditService
		),

		/*
		|----------------------------
		| Shared (Staff/Admin reuse)
		|----------------------------
		*/
		getAllUsers: new GetAllUsers(userRepository),

		getUserById: new GetUserById(userRepository),

		/*
		|----------------------------
		| Staff
		|----------------------------
		*/
		searchUser: new SearchUser(userRepository),

		impersonateUser: new ImpersonateUser(
			userRepository,
			auditService
		),

		/*
		|----------------------------
		| Admin
		|----------------------------
		*/
		createUser: new CreateUser(
			userRepository,
			passwordService,
			auditService,
			analyticsTracker
		),

		updateRole: new UpdateRole(
			userRepository,
			auditService
		),

		updateUserProfile: new UpdateUserProfile(
			userRepository,
			auditService
		),

		deleteUser: new DeleteUser(
			userRepository,
			auditService
		),

		banUser: new BanUser(
			userRepository,
			auditService
		)
	};

	/*
	|--------------------------------------------------------------------------
	| Controllers
	|--------------------------------------------------------------------------
	*/
	const selfController = new SelfController(usecases);
	const staffController = new StaffController(usecases);
	const adminController = new AdminController(usecases);

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/
	const routes = userRoutes({
		selfController,
		staffController,
		adminController,
		permissionService,
		userRepository
	});

	return { routes };
}