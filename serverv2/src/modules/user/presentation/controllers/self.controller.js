// src/modules/user/presentation/controllers/self.controller.js

import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import { successResponse } from "../../../../shared/utils/api-response.js";

export class SelfController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	// -----------------------------
	// GET /users/me
	// -----------------------------
	getProfile = async (req, res) => {
		const userId = req.user?.id;

		if (!userId) {
			throw new UnauthorizedError("User not authenticated");
		}

		const user = await this.usecases.getMyProfile.execute({ userId });

		return successResponse({
			res,
			data: user
		});
	};

	// -----------------------------
	// PUT /users/me
	// -----------------------------
	updateProfile = async (req, res) => {
		const userId = req.user?.id;

		if (!userId) {
			throw new UnauthorizedError("User not authenticated");
		}

		const updatedUser = await this.usecases.updateMyProfile.execute({
			userId,
			profileData: req.body, // ✅ FIXED
			ip: req.ip             // ✅ optional but good
		});

		return successResponse({
			res,
			data: updatedUser,
			message: "Profile updated successfully"
		});
	};

	// -----------------------------
	// POST /users/me/change-password
	// -----------------------------
	changePassword = async (req, res) => {
		const userId = req.user?.id;

		if (!userId) {
			throw new UnauthorizedError("User not authenticated");
		}

		const { currentPassword: oldPassword, newPassword } = req.body;

		await this.usecases.changePassword.execute({
			userId,
			oldPassword,
			newPassword,
			ip: req.ip
		});

		return successResponse({
			res,
			message: "Password changed successfully"
		});
	};
	async uploadAvatar(req, res) {
		try {
			const user = await this.usecases.uploadAvatar.execute({
				userId: req.user.id,
				file: req.file,
				ip: req.ip
			});
			res.json(user); // entity -> toJSON
		} catch (err) {
			res.status(err.statusCode || 500).json({ message: err.message });
		}
	}
}