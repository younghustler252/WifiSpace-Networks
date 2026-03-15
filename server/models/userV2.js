const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		// -------------------------
		// Identity
		// -------------------------
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
			match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
		},

		password: {
			type: String,
			required: function () {
				return !this.googleId;
			}
		},

		googleId: String,
		profilePicture: String,

		// -------------------------
		// Global System Roles
		// -------------------------
		role: {
			type: String,
			enum: ['user', 'customerService', 'admin', 'superadmin'],
			default: 'user'
		},

		isVerified: {
			type: Boolean,
			default: false
		},
		verificationToken: String,

		themePreference: {
			type: String,
			enum: ['light', 'dark', 'system'],
			default: 'system'
		}
	},
	{ timestamps: true }
);

// -------------------------
// Hash Password
// -------------------------
userSchema.pre('save', async function (next) {
	if (this.password && this.isModified('password')) {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	}
	next();
});

// -------------------------
// Compare Password
// -------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
	if (!this.password) return false;
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports =
	mongoose.models.User || mongoose.model('User', userSchema);
