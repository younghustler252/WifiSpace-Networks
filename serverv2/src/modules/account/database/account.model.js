// account.model.js — base schema (shared fields only)
const accountSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		wsnId: { type: String, required: true, unique: true, trim: true },
		accountType: { type: String, enum: ACCOUNT_TYPE_LIST, default: "personal" },
		businessName: { type: String, trim: true },
		companyRegistrationNumber: { type: String, trim: true },
		taxId: { type: String, trim: true },

		status: {
		type: String,
		enum: ["active", "suspended", "paused", "terminated"],
		default: "active",
		index: true
		},

		approvalStatus: { type: String, enum: APPROVAL_STATUS_LIST, default: "approved" },
		approvalNote: { type: String, default: null },
		approvedAt: { type: Date, default: null },
		approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

		devices: [{
		macAddress: { type: String, uppercase: true, trim: true },
		hostname: String,
		lastSeenAt: Date
		}]
	},
	{ timestamps: true, discriminatorKey: "serviceType" }
);

export const Account = mongoose.model("Account", accountSchema);

// pppoe-account.model.js
const pppoeSchema = new mongoose.Schema({
  routerId: { type: mongoose.Schema.Types.ObjectId, ref: "Router", required: true },
  routerProfile: { type: String, default: "default" },
  routerPasswordEncrypted: { type: String, required: true, select: false },
  limitUptime: { type: Number, default: 0 }
});

export const PppoeAccount = Account.discriminator("pppoe", pppoeSchema);

// hotspot-account.model.js
const hotspotSchema = new mongoose.Schema({
  maxDevices: { type: Number, default: 1 } // deluxe plan device cap lives here or on Plan
});

export const HotspotAccount = Account.discriminator("hotspot", hotspotSchema);