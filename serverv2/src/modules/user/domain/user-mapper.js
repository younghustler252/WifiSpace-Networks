import { User } from "./user.entity.js";

export class UserMapper {

	// ----------------------------
	// Mongo → Domain Entity
	// ----------------------------
	static toDomain(raw) {
		if (!raw) return null;

		return new User({
			id: raw._id?.toString() || raw.id,

			firstName: raw.firstName,
			lastName: raw.lastName,
			email: raw.email,

			avatar: raw.avatar,
			hashedPassword: raw.password, // ✅ important mapping

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

			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,

			theme: raw.theme || 'system'  // Map theme from DB (default to 'system')
		});
	}

	// ----------------------------
	// Domain → Persistence
	// ----------------------------
	static toPersistence(user) {
		return {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,

			password: user.hashedPassword, // ✅ consistent

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

			// Save the theme as well
			theme: user.theme || 'system'  // Ensure theme is saved to DB (default to 'system')
		};
	}
}