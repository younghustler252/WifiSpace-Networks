// modules/user/domain/user.entity.js

import { ValidationError } from "../../../shared/errors/validation-error.js";

export class User {
	constructor({
		id,
		firstName,
		lastName,
		email,
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
		lastLoginAt = null
	}) {
		if (!email) throw new ValidationError("Email is required");
		if (!firstName) throw new ValidationError("First name is required");
		if (!lastName) throw new ValidationError("Last name is required");

		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.password = hashedPassword;
		this.role = role;
		this.status = status;
		this.isVerified = isVerified;

		this.permissions =
			permissions.length ? permissions : ROLES[role] || [];

		this.phone = phone;
		this.nin = nin;
		this.address = address;
		this.dateOfBirth = dateOfBirth;
		this.gender = gender;

		this.failedLoginAttempts = failedLoginAttempts;
		this.lockUntil = lockUntil;
		this.passwordChangedAt = passwordChangedAt;
		this.lastLoginAt = lastLoginAt;
	}

	// ----------------------------
	// Status Management
	// ----------------------------

	isActive() {
		return this.status === "active";
	}

	suspend() {
		this.status = "suspended";
	}

	ban() {
		this.status = "banned";
	}

	activate() {
		this.status = "active";
	}

	// ----------------------------
	// Verification
	// ----------------------------

	verify() {
		this.isVerified = true;
	}

	// ----------------------------
	// Login Security
	// ----------------------------

	isLocked() {
		return this.lockUntil && this.lockUntil > new Date();
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

	updateProfile({ firstName, lastName, phone, address, gender, dateOfBirth }) {
		if (firstName) this.firstName = firstName;
		if (lastName) this.lastName = lastName;
		if (phone) this.phone = phone;
		if (address) this.address = address;
		if (gender) this.gender = gender;
		if (dateOfBirth) this.dateOfBirth = dateOfBirth;
	}

	getFullName() {
		return `${this.firstName} ${this.lastName}`;
	}
}