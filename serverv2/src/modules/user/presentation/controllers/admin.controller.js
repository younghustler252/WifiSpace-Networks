import { successResponse } from "../../../../shared/utils/api-response.js";

export class AdminController {

	constructor({
		createUser,
		getAllUsers,
		getUserById,
		updateRole,
		updateUserProfile,
		deleteUser,
		banUser
	}) {

		this.createUserUseCase = createUser;
		this.getAllUsersUseCase = getAllUsers;
		this.getUserByIdUseCase = getUserById;
		this.updateRoleUseCase = updateRole;
		this.updateUserProfileUseCase = updateUserProfile;
		this.deleteUserUseCase = deleteUser;
		this.banUserUseCase = banUser;
	}

	// Create User
	createUser = async (req, res) => {

		const actor = req.user;
		const userData = req.body;

		const user =
			await this.createUserUseCase.execute(
				actor,
				userData
			);

		return successResponse({
			res,
			data: user,
			message: "User created successfully"
		});
	};

	getAllUsers = async (req, res) => {

		const actor = req.user;

		const users =
			await this.getAllUsersUseCase.execute({
				...req.query,
				currentUser: actor
			});

		return successResponse({
			res,
			data: users,
			message: "Users fetched successfully"
		});
	};

	getUserById = async (req, res) => {

		const actor = req.user;
		const { id } = req.params;

		const user =
			await this.getUserByIdUseCase.execute(
				actor,
				id
			);

		return successResponse({
			res,
			data: user,
			message: "User fetched successfully"
		});
	};

	updateRole = async (req, res) => {

		const actor = req.user;
		const { userId, role } = req.body;

		const user =
			await this.updateRoleUseCase.execute(
				actor,
				userId,
				role
			);

		return successResponse({
			res,
			data: user,
			message: "Role updated successfully"
		});
	};

	updateUserProfile = async (req, res) => {

		const actor = req.user;
		const { userId } = req.params;
		const profileData = req.body;

		const user =
			await this.updateUserProfileUseCase.execute({
				userId,
				profileData,
				actorId: actor.id,
				ip: req.ip
			});

		return successResponse({
			res,
			data: user,
			message: "User profile updated successfully"
		});
	};

	deleteUser = async (req, res) => {

		const actor = req.user;
		const { userId } = req.params;

		const message =
			await this.deleteUserUseCase.execute(
				actor,
				userId
			);

		return successResponse({
			res,
			message
		});
	};

	banUser = async (req, res) => {

		const actor = req.user;
		const { userId } = req.params;

		const message =
			await this.banUserUseCase.execute(
				actor,
				userId
			);

		return successResponse({
			res,
			message
		});
	};
}