import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
	firstName: {
		type: String,
		required: true,
		trim: true
	},

	lastName: {
		type: String,
		required: true,
		trim: true
	},

	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		index: true,
		match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
	},

	password: {
		type: String,
		required: true
	},

	role: {
		type: String,
		enum: ["customer", "staff", "superadmin"],
		default: "customer"
	},

	permissions: {
		type: [String],
		default: []
	},

	// 🔥 ENTERPRISE STATUS
	status: {
		type: String,
		enum: ["active", "suspended", "banned"],
		default: "active",
		index: true
	},

	isVerified: {
		type: Boolean,
		default: false
	},

	// 🔥 SECURITY TRACKING
	lastLoginAt: {
		type: Date
	},

	failedLoginAttempts: {
		type: Number,
		default: 0
	},

	lockUntil: {
		type: Date
	},

	passwordChangedAt: {
		type: Date
	},

	// PROFILE
	phone: { type: String, trim: true },

	nin: {
		type: String,
		trim: true,
		index: {
			unique: true,
			partialFilterExpression: { nin: { $exists: true, $ne: null } }
		}
	},

	address: { type: String, trim: true },

	dateOfBirth: { type: Date },

	gender: {
		type: String,
		enum: ["male", "female", "other"]
	},

	verificationToken: { type: String },

	googleId: { type: String }

},
{ timestamps: true }
);

// Hide sensitive fields
userSchema.set("toJSON", {
	transform: (doc, ret) => {
		delete ret.password;
		delete ret.verificationToken;
		delete ret.googleId;
		delete ret.failedLoginAttempts;
		delete ret.lockUntil;
		return ret;
	}
});

export default mongoose.model("User", userSchema);