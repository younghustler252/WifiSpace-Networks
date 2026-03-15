// modules/user/controllers/staff.controller.js
import asyncHandler from "express-async-handler";
import { ImpersonateUser } from "../usecases/staff/impersonate-user.usecase.js";
import { SearchUser } from "../usecases/staff/search-user.usecase.js";
import { GetAllUsers } from "../usecases/shared/get-all-users.usecase.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { successResponse } from "../../../shared/utils/response.util.js"; // consistency

export class StaffController {
	constructor(userRepository) {
		this.impersonateUserUseCase = new ImpersonateUser(userRepository);
		this.searchUserUseCase = new SearchUser(userRepository);
		this.getAllUsersUseCase = new GetAllUsers(userRepository);
	}

	// Impersonate User
	impersonateUser = asyncHandler(async (req, res) => {
		const actor = req.user;
		const { userId } = req.params;

		const user = await this.impersonateUserUseCase.execute(actor, userId);
		return successResponse({ res, data: user, message: "Impersonation successful" });
	});

	// Search User
	searchUser = asyncHandler(async (req, res) => {
		const actor = req.user;
		const { query } = req.query;

		const users = await this.searchUserUseCase.execute(actor, query);
		return successResponse({ res, data: users, message: "Users fetched successfully" });
	});

	// Get All Users
	getAllUsers = asyncHandler(async (req, res) => {
		const actor = req.user;
		const filter = req.query.filter || {};  // You can adjust the filter format as needed
		const skip = req.query.skip || 0;
		const limit = req.query.limit || 50;

		const users = await this.getAllUsersUseCase.execute(filter, skip, limit);
		return successResponse({ res, data: users, message: "Users fetched successfully" });
	});
}