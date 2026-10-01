import { User } from "./user.entity.js";

export class UserMapper {
	static toDomain(raw) {
		if (!raw) return null;

		return new User({
			id: raw._id?.toString() || raw.id,

			firstName: raw.firstName,
			lastName: raw.lastName,
			email: raw.email,

			avatar: raw.avatar,
			hashedPassword: raw.password,

			role: raw.role,
			status: raw.status,
			isVerified: raw.isVerified,
			permissions: raw.permissions,

			phone: raw.phone,
			nin: raw.nin,
			address: raw.address,
			dateOfBirth: raw.dateOfBirth,
			gender: raw.gender,

			failedLoginAttempts: raw.failedLoginAttempts,
			lockUntil: raw.lockUntil,
			passwordChangedAt: raw.passwordChangedAt,
			lastLoginAt: raw.lastLoginAt,

			verificationOTP: raw.verificationOTP,
			otpExpiresAt: raw.otpExpiresAt,
			otpAttempts: raw.otpAttempts,
			otpLockedUntil: raw.otpLockedUntil,
			lastOtpSentAt: raw.lastOtpSentAt,

			resetPasswordOTP: raw.resetPasswordOTP,
			resetPasswordOTPExpiresAt: raw.resetPasswordOTPExpiresAt,
			resetPasswordAttempts: raw.resetPasswordAttempts,
			resetPasswordOTPLockedUntil: raw.resetPasswordOTPLockedUntil,
			lastResetPasswordOtpSentAt: raw.lastResetPasswordOtpSentAt,

			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,

			theme: raw.theme || "system"
		});
	}

	static toPersistence(user) {
		const data = {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,

			password: user.hashedPassword,

			avatar: user.avatar,
			role: user.role,
			status: user.status,
			isVerified: user.isVerified,
			permissions: user.permissions,

			phone: user.phone,
			nin: user.nin,
			address: user.address,
			dateOfBirth: user.dateOfBirth,
			gender: user.gender,

			failedLoginAttempts: user.failedLoginAttempts,
			lockUntil: user.lockUntil,
			passwordChangedAt: user.passwordChangedAt,
			lastLoginAt: user.lastLoginAt,

			verificationOTP: user.verificationOTP,
			otpExpiresAt: user.otpExpiresAt,
			otpAttempts: user.otpAttempts,
			otpLockedUntil: user.otpLockedUntil,
			lastOtpSentAt: user.lastOtpSentAt,

			resetPasswordOTP: user.resetPasswordOTP,
			resetPasswordOTPExpiresAt: user.resetPasswordOTPExpiresAt,
			resetPasswordAttempts: user.resetPasswordAttempts,
			resetPasswordOTPLockedUntil: user.resetPasswordOTPLockedUntil,
			lastResetPasswordOtpSentAt: user.lastResetPasswordOtpSentAt,

			theme: user.theme || "system"
		};

		return Object.fromEntries(
			Object.entries(data).filter(([, value]) => value !== undefined)
		);
	}
}