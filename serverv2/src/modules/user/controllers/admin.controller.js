import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({
		createUser, getAllUsers, getUserById, adminUpdateUserProfile,
		updateRole, banUser, unbanUser, deleteUser, adminSetUserPassword, impersonateUser
	}) {
		this.createUserUseCase = createUser;
		this.getAllUsersUseCase = getAllUsers;
		this.getUserByIdUseCase = getUserById;
		this.adminUpdateUserProfileUseCase = adminUpdateUserProfile;
		this.updateRoleUseCase = updateRole;
		this.banUserUseCase = banUser;
		this.unbanUserUseCase = unbanUser;
		this.deleteUserUseCase = deleteUser;
		this.adminSetUserPasswordUseCase = adminSetUserPassword;
		this.impersonateUserUseCase = impersonateUser;
	}

	createUser = async (req, res) => {
		const user = await this.createUserUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: user.toJSON(), message: "User created successfully", statusCode: 201 });
	};

	getAllUsers = async (req, res) => {
		const { data, meta } = await this.getAllUsersUseCase.execute({ actorRole: req.user.role, ...req.query });
		return paginatedResponse({ res, data: data.map((u) => u.toJSON()), meta, message: "Users fetched successfully" });
	};

	getUserById = async (req, res) => {
		const user = await this.getUserByIdUseCase.execute({ targetId: req.params.id });
		return successResponse({ res, data: user.toJSON(), message: "User fetched successfully" });
	};

	updateUserProfile = async (req, res) => {
		const user = await this.adminUpdateUserProfileUseCase.execute({
			actorId: req.user.id, actorRole: req.user.role, targetId: req.params.id, profileData: req.body, ip: req.ip
		});
		return successResponse({ res, data: user.toJSON(), message: "User updated successfully" });
	};

	updateRole = async (req, res) => {
		const user = await this.updateRoleUseCase.execute({
			actorId: req.user.id, actorRole: req.user.role, targetId: req.params.id, role: req.body.role, ip: req.ip
		});
		return successResponse({ res, data: user.toJSON(), message: "Role updated successfully" });
	};

	banUser = async (req, res) => {
		const user = await this.banUserUseCase.execute({
			actorId: req.user.id, actorRole: req.user.role, targetId: req.params.id, reason: req.body.reason, ip: req.ip
		});
		return successResponse({ res, data: user.toJSON(), message: "User banned successfully" });
	};

	unbanUser = async (req, res) => {
		const user = await this.unbanUserUseCase.execute({ actorId: req.user.id, targetId: req.params.id, ip: req.ip });
		return successResponse({ res, data: user.toJSON(), message: "User unbanned successfully" });
	};

	deleteUser = async (req, res) => {
		const result = await this.deleteUserUseCase.execute({
			actorId: req.user.id, actorRole: req.user.role, targetId: req.params.id, ip: req.ip
		});
		return successResponse({ res, message: result.message });
	};

	setUserPassword = async (req, res) => {
		const result = await this.adminSetUserPasswordUseCase.execute({
			actorId: req.user.id, actorRole: req.user.role, targetId: req.params.id, newPassword: req.body.newPassword, ip: req.ip
		});
		return successResponse({ res, message: result.message });
	};

	impersonateUser = async (req, res) => {
		const result = await this.impersonateUserUseCase.execute({
			actorId: req.user.id, actorRole: req.user.role, targetId: req.params.id, ip: req.ip
		});
		return successResponse({ res, data: result, message: "Impersonation token generated" });
	};
}