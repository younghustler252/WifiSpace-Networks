import mongoose from "mongoose";

const HotspotSessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true
		},

		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			required: true,
			index: true
		},

		routerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Router",
			required: true,
			index: true
		},

		macAddress: {
			type: String,
			required: true,
			trim: true,
			uppercase: true,
		},

		ipAddress: {
			type: String,
			default: null
		},

		userAgent: {
			type: String,
			default: null
		},

		status: {
            type: String,
            enum: [
                "pending",
                "authenticated",
                "expired",
                "revoked"
            ],
            default: "pending",
        },

		trustedDevice: {
			type: Boolean,
			default: false
		},

		lastSeenAt: {
			type: Date,
			default: Date.now
		},

		expiresAt: {
			type: Date,
			default: null,
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);

// Prevent duplicate remembered sessions for the same device
HotspotSessionSchema.index(
	{
		accountId: 1,
		macAddress: 1
	},
	{
		unique: true
	}
);

// Automatically remove expired sessions
HotspotSessionSchema.index(
	{
		expiresAt: 1
	},
	{
		expireAfterSeconds: 0
	}
);

export const HotspotSessionModel = mongoose.model(
	"HotspotSession",
	HotspotSessionSchema
);