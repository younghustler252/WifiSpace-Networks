import { successResponse } from "../../../shared/utils/api-response.js";

export class UserController {
	constructor({ getMyProfile, updateMyProfile, changePassword, uploadAvatar, requestEmailChange, confirmEmailChange }) {
		this.requestEmailChangeUseCase = requestEmailChange;
		this.confirmEmailChangeUseCase = confirmEmailChange;
		this.getMyProfileUseCase = getMyProfile;
		this.updateMyProfileUseCase = updateMyProfile;
		this.changePasswordUseCase = changePassword;
		this.uploadAvatarUseCase = uploadAvatar;
	}

	getMyProfile = async (req, res) => {
		const user = await this.getMyProfileUseCase.execute({ userId: req.user.id });
		return successResponse({ res, data: user.toJSON(), message: "Profile fetched successfully" });
	};

	updateMyProfile = async (req, res) => {
		const user = await this.updateMyProfileUseCase.execute({ userId: req.user.id, profileData: req.body, ip: req.ip });
		return successResponse({ res, data: user.toJSON(), message: "Profile updated successfully" });
	};

	changePassword = async (req, res) => {
		const result = await this.changePasswordUseCase.execute({ userId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, message: result.message });
	};

	requestEmailChange = async (req, res) => {
		const result = await this.requestEmailChangeUseCase.execute({ userId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: result, message: "Verification code sent to your new email address" });
	};

	confirmEmailChange = async (req, res) => {
		const user = await this.confirmEmailChangeUseCase.execute({ userId: req.user.id, otp: req.body.otp, ip: req.ip });
		return successResponse({ res, data: user.toJSON(), message: "Email address updated" });
	};

	uploadAvatar = async (req, res) => {
		const result = await this.uploadAvatarUseCase.execute({ userId: req.user.id, file: req.file });
		return successResponse({ res, data: result, message: "Avatar updated successfully" });
	};
}