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
			trim: true
		},

		

		pppoePassword: {
			type: String
		},

		// ----------------------------
		// Router Info
		// ----------------------------

		routerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Router",
            required: true, // Make this required!
        },

		routerProfile: {
			type: String,
			default: "default",
		},
		macAddress: {
			type: String,
			trim: true,
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
		},

		// ----------------------------
		// Monitoring
		// ----------------------------
		limitUptime: {
            type: String, // format "2h", "30m", or seconds
            default: "0"
        },

        limitBytes: {
            type: Number, // In bytes (e.g., 1073741824 for 1GB)
            default: 0
        },

		lastSeenAt: {
			type: Date,
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