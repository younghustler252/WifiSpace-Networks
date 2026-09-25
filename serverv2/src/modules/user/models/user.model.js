import mongoose from "mongoose";
import { USER_ROLE_LIST, USER_STATUS_LIST, GENDER_LIST, THEME_LIST } from "../../domain/user.enum.js";

const userSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },

		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
			match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
		},

		password: { type: String, required: true, select: false },

		avatar: {
			url: { type: String, default: "https://default-avatar.png" },
			publicId: { type: String, default: null }
		},

		isVerified: { type: Boolean, default: false },

		role: { type: String, enum: USER_ROLE_LIST, default: "customer" },
		permissions: { type: [String], default: [] },

		status: { type: String, enum: USER_STATUS_LIST, default: "active", index: true },

		lastLoginAt: { type: Date },
		failedLoginAttempts: { type: Number, default: 0, select: false },
		lockUntil: { type: Date, select: false },
		passwordChangedAt: { type: Date },

		phone: { type: String, trim: true },

		nin: {
			type: String,
			trim: true,
			index: { unique: true, partialFilterExpression: { nin: { $exists: true, $ne: null } } }
		},

		address: { type: String, trim: true },
		dateOfBirth: { type: Date },
		gender: { type: String, enum: GENDER_LIST },

		verificationOTP: { type: String, select: false },
		otpExpiresAt: { type: Number, select: false },
		otpAttempts: { type: Number, default: 0, select: false },
		otpLockedUntil: { type: Number, select: false },
		lastOtpSentAt: { type: Number },

		googleId: { type: String, select: false },

		theme: { type: String, enum: THEME_LIST, default: "system" }
	},
	{ timestamps: true }
);

userSchema.set("toJSON", {
	transform: (doc, ret) => {
		delete ret.password;
		delete ret.verificationOTP;
		delete ret.googleId;
		delete ret.failedLoginAttempts;
		delete ret.lockUntil;
		return ret;
	}
});

export default mongoose.model("User", userSchema);