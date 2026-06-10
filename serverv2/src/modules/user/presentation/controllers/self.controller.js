import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import { successResponse } from "../../../../shared/utils/api-response.js";

export class SelfController {

	constructor({
		getMyProfile,
		updateMyProfile,
		changePassword,
		uploadAvatar
	}) {
		this.getMyProfileUseCase = getMyProfile;
		this.updateMyProfileUseCase = updateMyProfile;
		this.changePasswordUseCase = changePassword;
		this.uploadAvatarUseCase = uploadAvatar;
	}

	getProfile = async (req, res) => {

		const userId = req.user?.id;

		if (!userId) {
			throw new UnauthorizedError("User not authenticated");
		}

		const user =
			await this.getMyProfileUseCase.execute({ userId });

		return successResponse({
			res,
			data: user
		});
	};

	updateProfile = async (req, res) => {

		const userId = req.user?.id;

		if (!userId) {
			throw new UnauthorizedError("User not authenticated");
		}

		const updatedUser =
			await this.updateMyProfileUseCase.execute({
				userId,
				profileData: req.body,
				ip: req.ip
			});

		return successResponse({
			res,
			data: updatedUser,
			message: "Profile updated successfully"
		});
	};

	changePassword = async (req, res) => {

		const userId = req.user?.id;

		if (!userId) {
			throw new UnauthorizedError("User not authenticated");
		}

		const { currentPassword: oldPassword, newPassword } = req.body;

		await this.changePasswordUseCase.execute({
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

	uploadAvatar = async (req, res) => {

		const user =
			await this.uploadAvatarUseCase.execute({
				userId: req.user.id,
				file: req.file,
				ip: req.ip
			});

		return successResponse({
			res,
			data: user,
			message: "Avatar uploaded successfully"
		});
	};
}