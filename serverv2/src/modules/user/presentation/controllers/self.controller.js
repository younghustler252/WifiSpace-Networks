// modules/user/controller/self.controller.js
import asyncHandler from "express-async-handler";
import { GetMyProfileUseCase } from "../usecases/self/get-my-profile.usecase.js";
import { UpdateMyProfileUseCase } from "../usecases/self/update-my-profile.usecase.js";
import { ChangePasswordUseCase } from "../usecases/self/change-password.usecase.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { successResponse } from "../../../shared/utils/response.util.js"; // <--- here

export class SelfController {
	constructor(userRepository, passwordService) {
		this.getMyProfileUseCase = new GetMyProfileUseCase(userRepository);
		this.updateMyProfileUseCase = new UpdateMyProfileUseCase(userRepository);
		this.changePasswordUseCase = new ChangePasswordUseCase(userRepository, passwordService);
	}

	getProfile = asyncHandler(async (req, res) => {
		const userId = req.user?.id;
		if (!userId) throw new UnauthorizedError("User not authenticated");

		const user = await this.getMyProfileUseCase.execute({ userId });

		return successResponse({ res, data: user });
	});

	updateProfile = asyncHandler(async (req, res) => {
		const userId = req.user?.id;
		if (!userId) throw new UnauthorizedError("User not authenticated");

		const updateData = req.body;
		const updatedUser = await this.updateMyProfileUseCase.execute({
			userId,
			updateData
		});

		return successResponse({ res, data: updatedUser, message: "Profile updated successfully" });
	});

	changePassword = asyncHandler(async (req, res) => {
		const userId = req.user?.id;
		if (!userId) throw new UnauthorizedError("User not authenticated");

		const { currentPassword, newPassword } = req.body;
		await this.changePasswordUseCase.execute({
			userId,
			currentPassword,
			newPassword
		});

		return successResponse({ res, message: "Password changed successfully" });
	});
}