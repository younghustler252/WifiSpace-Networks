import { ROLE_PERMISSIONS } from "../../../shared/constants/roles.js";
import { ValidationError } from "../../../shared/errors/domain-errors.js";
import { maskNin } from "../../../shared/utils/mask-sensitive.js";
import { USER_ROLE, USER_STATUS, THEME } from "./user.enum.js";

export class User {
	constructor({
		id,
		firstName,
		lastName,
		email,
		avatar,
		hashedPassword,
		role = USER_ROLE.CUSTOMER,
		status = USER_STATUS.ACTIVE,
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
		otpAttempts = 0,
		otpLockedUntil = null,
		lastOtpSentAt = null,
		createdAt = null,
		updatedAt = null,
		theme = THEME.SYSTEM
	}) {
		if (!email) throw new ValidationError("Email is required");
		if (!firstName) throw new ValidationError("First name is required");
		if (!lastName) throw new ValidationError("Last name is required");

		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;

		this.avatar = avatar ?? {
			url: "https://default-avatar.png",
			publicId: null
		};

		this.hashedPassword = hashedPassword;

		this.role = role;
		this.status = status;
		this.isVerified = isVerified;

		this.permissions = permissions?.length > 0
			? permissions
			: ROLE_PERMISSIONS[role] || [];

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
		this.otpAttempts = otpAttempts;
		this.otpLockedUntil = otpLockedUntil;
		this.lastOtpSentAt = lastOtpSentAt;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;

		this.theme = theme;
	}

	// ----------------------------
	// Safe Output (DTO)
	// ----------------------------
	toJSON({ exposeSensitive = false } = {}) {
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
			nin: exposeSensitive ? this.nin : maskNin(this.nin),
			address: this.address,
			dateOfBirth: this.dateOfBirth
				? new Date(this.dateOfBirth).toISOString().split("T")[0]
				: null,
			gender: this.gender,
			lastLoginAt: this.lastLoginAt,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			theme: this.theme
		};
	}

	// ----------------------------
	// Status Management
	// ----------------------------
	isActive() {
		return this.status === USER_STATUS.ACTIVE;
	}

	suspend() {
		this.status = USER_STATUS.SUSPENDED;
	}

	ban() {
		this.status = USER_STATUS.BANNED;
	}

	activate() {
		this.status = USER_STATUS.ACTIVE;
	}

	// ----------------------------
	// Verification
	// ----------------------------
	verify() {
		this.isVerified = true;
		this.clearVerificationOTP();
		this.lastOtpSentAt = null;
	}

	setVerificationStatus(isVerified) {
		this.isVerified = isVerified;
	}

	// ----------------------------
	// Login Security
	// ----------------------------
	isLocked() {
		return Boolean(this.lockUntil && this.lockUntil > new Date());
	}

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

	markPasswordChanged() {
		this.passwordChangedAt = new Date();
	}

	// ----------------------------
	// Profile Updates
	// ----------------------------
	updatePermissions(newPermissions = []) {
		this.permissions = newPermissions;
	}

	updateProfile({
		firstName,
		lastName,
		phone,
		address,
		gender,
		dateOfBirth,
		nin,
		theme,
		isVerified
	} = {}) {
		if (firstName !== undefined) this.firstName = firstName;
		if (lastName !== undefined) this.lastName = lastName;
		if (phone !== undefined) this.phone = phone;
		if (nin !== undefined) this.nin = nin;
		if (address !== undefined) this.address = address;
		if (gender !== undefined) this.gender = gender;
		if (dateOfBirth !== undefined) this.dateOfBirth = dateOfBirth;
		if (theme !== undefined) this.theme = theme;

		if (typeof isVerified === "boolean") {
			this.setVerificationStatus(isVerified);
		}
	}

	// ----------------------------
	// OTP Management
	// ----------------------------
	setVerificationOTP(otp, expiresAt) {
		this.verificationOTP = otp;
		this.otpExpiresAt = expiresAt;
		this.otpAttempts = 0;
		this.otpLockedUntil = null;
	}

	incrementOTPAttempts(maxAttempts = 5, lockMinutes = 15) {
		this.otpAttempts += 1;

		if (this.otpAttempts >= maxAttempts) {
			this.otpLockedUntil = Date.now() + lockMinutes * 60 * 1000;
		}
	}

	canAttemptOTP(maxAttempts = 5) {
		return this.otpAttempts < maxAttempts;
	}

	isOTPLocked() {
		return Boolean(this.otpLockedUntil && Date.now() < this.otpLockedUntil);
	}

	unlockOTPIfExpired() {
		if (this.otpLockedUntil && Date.now() >= this.otpLockedUntil) {
			this.otpAttempts = 0;
			this.otpLockedUntil = null;
		}
	}

	markOtpSent() {
		this.lastOtpSentAt = Date.now();
	}

	canResendOTP(cooldownSeconds = 60) {
		if (!this.lastOtpSentAt) return true;
		return Date.now() - this.lastOtpSentAt >= cooldownSeconds * 1000;
	}

	clearVerificationOTP() {
		this.verificationOTP = null;
		this.otpExpiresAt = null;
		this.otpAttempts = 0;
		this.otpLockedUntil = null;
	}

	isOTPExpired() {
		return !this.otpExpiresAt || Date.now() > this.otpExpiresAt;
	}

	// ----------------------------
	// Avatar
	// ----------------------------
	updateAvatar({ url, publicId }) {
		if (!url) throw new ValidationError("Avatar URL is required");

		this.avatar = { url, publicId: publicId || null };
	}

	removeAvatar() {
		this.avatar = { url: "https://default-avatar.png", publicId: null };
	}

	// ----------------------------
	// Helpers
	// ----------------------------
	getFullName() {
		return `${this.firstName} ${this.lastName}`;
	}
}