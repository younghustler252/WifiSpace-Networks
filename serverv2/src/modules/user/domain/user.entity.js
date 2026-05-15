import { ROLE_PERMISSIONS } from "../../../shared/constants/roles.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";

export class User {
	constructor({
		id,
		firstName,
		lastName,
		email,
		avatar,
		hashedPassword,
		role = "customer",
		status = "active",
		isVerified = false,
		permissions = [],
		phone = null,
		nin = null,
		address = null,
		dateOfBirth = null,
		gender = null,
		failedLoginAttempts = 0,
		lockUntil = null,
		passwordChangedAt = null,
		lastLoginAt = null,
		verificationOTP = null,
		otpExpiresAt = null,
		createdAt = null,
		updatedAt = null,
		theme = "system" // 🔥 New theme field
	}) {
		if (!email) throw new ValidationError("Email is required");
		if (!firstName) throw new ValidationError("First name is required");
		if (!lastName) throw new ValidationError("Last name is required");

		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;

		this.avatar = avatar ?? { url: "https://default-avatar.png", publicId: null };
		this.hashedPassword = hashedPassword;
		this.role = role;
		this.status = status;
		this.isVerified = isVerified;

		this.permissions = permissions && permissions.length ? permissions : ROLE_PERMISSIONS[role] || [];

		this.phone = phone;
		this.nin = nin;
		this.address = address;
		this.dateOfBirth = dateOfBirth;
		this.gender = gender;

		this.failedLoginAttempts = failedLoginAttempts;
		this.lockUntil = lockUntil;
		this.passwordChangedAt = passwordChangedAt;
		this.lastLoginAt = lastLoginAt;
		this.verificationOTP = verificationOTP;
		this.otpExpiresAt = otpExpiresAt;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;

		this.theme = theme; // save user preference
	}

	// ----------------------------
	// Safe Output (DTO)
	// Include all safe fields like nin, theme, etc.
	// Exclude sensitive fields like hashedPassword, OTPs
	// ----------------------------
	toJSON() {
		return {
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			avatar: this.avatar,
			role: this.role,
			status: this.status,
			isVerified: this.isVerified,
			permissions: this.permissions,
			phone: this.phone,
			nin: this.nin, // include NIN
			address: this.address,
			dateOfBirth: this.dateOfBirth,
			gender: this.gender,
			lastLoginAt: this.lastLoginAt,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			theme: this.theme // include theme
		};
	}

	// ----------------------------
	// Status Management
	// ----------------------------
	isActive() { return this.status === "active"; }
	suspend() { this.status = "suspended"; }
	ban() { this.status = "banned"; }
	activate() { this.status = "active"; }

	// ----------------------------
	// Verification
	// ----------------------------
	verify() { this.isVerified = true; }

	// ----------------------------
	// Login Security
	// ----------------------------
	isLocked() { return this.lockUntil && this.lockUntil > new Date(); }

	recordFailedLogin(maxAttempts = 5, lockMinutes = 15) {
		this.failedLoginAttempts += 1;
		if (this.failedLoginAttempts >= maxAttempts) {
			const lockTime = new Date();
			lockTime.setMinutes(lockTime.getMinutes() + lockMinutes);
			this.lockUntil = lockTime;
		}
	}

	resetLoginAttempts() {
		this.failedLoginAttempts = 0;
		this.lockUntil = null;
		this.lastLoginAt = new Date();
	}

	markPasswordChanged() { this.passwordChangedAt = new Date(); }

	// ----------------------------
	// Profile Updates
	// ----------------------------
	updatePermissions(newPermissions = []) { this.permissions = newPermissions; }

	updateProfile({ firstName, lastName, phone, address, gender, dateOfBirth,nin } = {}) {
		if (firstName) this.firstName = firstName;
		if (lastName) this.lastName = lastName;
		if (phone) this.phone = phone;
		if (nin) this.nin = nin;
		if (address) this.address = address;
		if (gender) this.gender = gender;
		if (dateOfBirth) this.dateOfBirth = dateOfBirth;

	}

	updateAvatar({ url, publicId }) {
		if (!url) throw new ValidationError("Avatar URL is required");
		this.avatar = { url, publicId: publicId || null };
	}

	removeAvatar() { this.avatar = { url: null, publicId: null }; }

	// ----------------------------
	// Helpers
	// ----------------------------
	getFullName() { return `${this.firstName} ${this.lastName}`; }
}