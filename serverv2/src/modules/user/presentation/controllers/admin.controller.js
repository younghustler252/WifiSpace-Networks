import { successResponse } from "../../../../shared/utils/api-response.js";

export class AdminController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	// Create User
	createUser = async (req, res) => {
		const actor = req.user;
		const userData = req.body;

		const user = await this.usecases.createUser.execute(actor, userData);

		return successResponse({
			res,
			data: user,
			message: "User created successfully"
		});
	};

	getAllUsers = async (req, res) => {
		const actor = req.user;

		const users = await this.usecases.getAllUsers.execute({
			...req.query,
			currentUser: actor
		});

		return successResponse({
			res,
			data: users,
			message: "Users fetched successfully"
		});
	};

	// ----------------------------
	// Get User By ID
	// ----------------------------
	getUserById = async (req, res) => {
		const actor = req.user;
		const { id } = req.params;

		const user = await this.usecases.getUserById.execute(actor, id);

		return successResponse({
			res,
			data: user,
			message: "User fetched successfully"
		});
	};


	// Update Role
	updateRole = async (req, res) => {
		const actor = req.user;
		const { userId, role } = req.body;

		const user = await this.usecases.updateRole.execute(actor, userId, role);

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

		const user = await this.usecases.updateUserProfile.execute({
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

	// Delete User
	deleteUser = async (req, res) => {
		const actor = req.user;
		const { userId } = req.params;

		const message = await this.usecases.deleteUser.execute(actor, userId);

		return successResponse({
			res,
			message
		});
	};

	// Ban User
	banUser = async (req, res) => {
		const actor = req.user;
		const { userId } = req.params;

		const message = await this.usecases.banUser.execute(actor, userId);

		return successResponse({
			res,
			message
		});
	};
}