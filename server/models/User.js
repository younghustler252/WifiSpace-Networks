const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --------------------------------------------------
//	UsageStats Schema
// --------------------------------------------------
const usageStatsSchema = new mongoose.Schema({
	totalDataUsed: { type: Number, default: 0 },			// bytes
	totalTimeOnline: { type: Number, default: 0 },		// seconds
	devicesConnected: { type: Number, default: 0 },
}, { _id: false });

// --------------------------------------------------
//	Active Session Schema (from MikroTik)
// --------------------------------------------------
const activeSessionSchema = new mongoose.Schema({
	sessionId: String,										// RouterOS .id
	ip: String,
	mac: String,
	uptime: String,
	bytesIn: Number,
	bytesOut: Number,
	loginBy: String,
	startedAt: Date
}, { _id: false });

// --------------------------------------------------
//	Main User Schema
// --------------------------------------------------
const userSchema = new mongoose.Schema({
	// -------------------------
	//	Basic Info
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
		match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
	},

	// -------------------------
	//	App Authentication
	// -------------------------
	password: {
		type: String,
		required: function () {
			return !this.googleId;
		}
	},

	profilePicture: String,

	// -------------------------
	//	Roles
	// -------------------------
	role: {
		type: String,
		enum: ['user', 'customerService', 'admin', 'superadmin'],
		default: 'user'
	},

	// -------------------------
	//	Subscription
	// -------------------------
	subscription: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Subscription'
	},
	subscriptionStatus: {
		type: String,
		enum: ['none', 'active', 'expired', 'suspended'],
		default: 'none'
	},
	subscriptionStart: Date,
	subscriptionEnd: Date,

	// -------------------------
	//	Usage Stats (DB historical)
	// -------------------------
	usageStats: usageStatsSchema,

	// -------------------------
	//	Router MAC
	// -------------------------
	macAddress: {
		type: String,
		set: v => v ? v.toLowerCase().replace(/[^a-f0-9]/g, '') : null
	},

	// -------------------------
	//	Email Verification
	// -------------------------
	isVerified: { type: Boolean, default: false },
	verificationToken: { type: String },

	// -------------------------
	//	Google OAuth
	// -------------------------
	googleId: { type: String },

	// -------------------------
	//	Custom Unique WSN ID
	// -------------------------
	wsnId: {
		type: String,
		unique: true,
		sparse: true
	},

	phone: {
		type: Number,
	},
	nin: {
		type: Number,
		unique: true
	},
	address: {
		type: String,

	},
	// -------------------------
	//	UI Theme
	// -------------------------
	themePreference: {

		type: String,
		enum: ['light', 'dark', 'system'],
		default: 'system'
	},

	// --------------------------------------------------
	//	MikroTik Integration (NEW)
	// --------------------------------------------------

	// 🔵 Did this user successfully sync to MikroTik?
	hotspotSynced: {
		type: Boolean,
		default: false
	},

	// 🔴 Error message from last failed sync
	hotspotError: {
		type: String,
		default: null
	},

	// ⏱ Timestamp of last MikroTik sync
	lastSyncAt: {
		type: Date,
		default: null
	},

	// 🔐 Router password (Hotspot password)
	routerPassword: {
		type: String
	},

	// 📌 MikroTik profile (plan)
	routerProfile: {
		type: String,
		default: "default"
	},
	cancelAtPeriodEnd: {
		type: Boolean,
		default: false,
	},

	// 🔵 Live sessions from accounting worker
	activeSessions: [activeSessionSchema],

	// 📊 Long-term cumulative usage
	totalBytesIn: { type: Number, default: 0 },
	totalBytesOut: { type: Number, default: 0 },

	// 🟢 Last time seen online
	lastSeenAt: { type: Date }
}, { timestamps: true });

// --------------------------------------------------
//	Virtual: fullName
// --------------------------------------------------
userSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});

// --------------------------------------------------
//	Hide Sensitive Data
// --------------------------------------------------
userSchema.set('toJSON', {
	transform: (doc, ret) => {
		delete ret.password;
		delete ret.verificationToken;
		delete ret.googleId;
		return ret;
	}
});

// --------------------------------------------------
//	Hash Password
// --------------------------------------------------
userSchema.pre('save', async function (next) {
	if (this.password && this.isModified('password')) {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	}
	next();
});

// --------------------------------------------------
//	Compare Passwords
// --------------------------------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
	if (!this.password) return false;
	return await bcrypt.compare(enteredPassword, this.password);
};

// --------------------------------------------------
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
