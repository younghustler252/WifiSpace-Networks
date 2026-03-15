import mongoose from "mongoose";

const ACCOUNT_TYPES = [
	"personal",
	"business"
];

const PROFILE_STATUSES = [
	"pending",
	"active",
	"suspended",
	"canceled"
];

const SERVICE_TYPES = [
	"pppoe",
	"hotspot"
];

const accountSchema = new mongoose.Schema(
	{
		// ----------------------------
		// Owner
		// ----------------------------

		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true
		},

		// ----------------------------
		// Account Type
		// ----------------------------

		accountType: {
			type: String,
			enum: ACCOUNT_TYPES,
			default: "personal"
		},

		// ----------------------------
		// Business Fields
		// ----------------------------

		businessName: {
			type: String,
			trim: true
		},

		companyRegistrationNumber: {
			type: String,
			trim: true
		},

		taxId: {
			type: String,
			trim: true
		},

		// ----------------------------
		// Network Identity
		// ----------------------------

		wsnId: {
			type: String,
			required: true,
			unique: true,
			index: true,
			trim: true
		},

		pppoePassword: {
			type: String
		},

		// ----------------------------
		// Router Info
		// ----------------------------

		routerId: {
			type: String,
			required: true,
			index: true
		},

		routerProfile: {
			type: String,
			default: "default",
			index: true
		},

		// ----------------------------
		// Service
		// ----------------------------

		serviceType: {
			type: String,
			enum: SERVICE_TYPES,
			default: "pppoe"
		},

		profileStatus: {
			type: String,
			enum: PROFILE_STATUSES,
			default: "pending",
			index: true
		},

		// ----------------------------
		// Monitoring
		// ----------------------------

		lastSeenAt: {
			type: Date,
			index: true
		},

		mikrotikUserCreated: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true
	}
);



// ----------------------------
// Performance Indexes
// ----------------------------

// find all accounts of a user
accountSchema.index({ userId: 1 });

// multi-router support
accountSchema.index({ routerId: 1 });

// router profile filtering
accountSchema.index({ routerProfile: 1 });

// profile status filtering
accountSchema.index({ profileStatus: 1 });

// active sessions dashboard
accountSchema.index({ lastSeenAt: -1 });



// ----------------------------
// Hide Sensitive Fields
// ----------------------------

accountSchema.set("toJSON", {
	transform: (doc, ret) => {

		delete ret.pppoePassword;

		return ret;
	}
});



export default mongoose.model("Account", accountSchema);