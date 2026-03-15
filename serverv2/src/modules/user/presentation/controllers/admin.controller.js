// modules/user/controllers/admin.controller.js

import asyncHandler from "express-async-handler";
import { CreateUser } from "../usecases/admin/create-user.usecase.js";
import { UpdateRole } from "../usecases/admin/update-role.usecase.js";
import { DeleteUser } from "../usecases/admin/delete-user.usecase.js";
import { BanUser } from "../usecases/admin/ban-user.usecase.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { successResponse } from "../../../shared/utils/response.util.js"; // <--- consistency

export class AdminController {
	constructor(userRepository, passwordService, auditService, permissionService) {
		this.createUserUseCase = new CreateUser(userRepository, passwordService, auditService, permissionService);
		this.updateRoleUseCase = new UpdateRole(userRepository, permissionService);
		this.deleteUserUseCase = new DeleteUser(userRepository);
		this.banUserUseCase = new BanUser(userRepository);
	}

	// Create User
	createUser = asyncHandler(async (req, res) => {
		const actor = req.user;
		const userData = req.body;

		const newUser = await this.createUserUseCase.execute(actor, userData);
		return successResponse({ res, data: newUser, message: "User created successfully" });
	});

	// Update Role
	updateRole = asyncHandler(async (req, res) => {
		const actor = req.user;
		const { userId, role } = req.body;

		const updatedUser = await this.updateRoleUseCase.execute(actor, userId, role);
		return successResponse({ res, data: updatedUser, message: "Role updated successfully" });
	});

	// Delete User
	deleteUser = asyncHandler(async (req, res) => {
		const actor = req.user;
		const { userId } = req.params;

		const message = await this.deleteUserUseCase.execute(actor, userId);
		return successResponse({ res, message });
	});

	// Ban User
	banUser = asyncHandler(async (req, res) => {
		const actor = req.user;
		const { userId } = req.params;

		const message = await this.banUserUseCase.execute(actor, userId);
		return successResponse({ res, message });
	});
}