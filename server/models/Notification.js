const mongoose = require("mongoose");

// --------------------------------------------------
// Channel Status Subschema
// --------------------------------------------------
const channelStatusSchema = new mongoose.Schema({
	inApp: {
		status: {
			type: String,
			enum: ["pending", "delivered", "failed"],
			default: "delivered"
		},
		deliveredAt: Date
	},

	email: {
		status: {
			type: String,
			enum: ["pending", "sent", "failed", "not_requested"],
			default: "not_requested"
		},
		sentAt: Date,
		error: String
	},

	whatsapp: {
		status: {
			type: String,
			enum: ["pending", "sent", "failed", "not_requested"],
			default: "not_requested"
		},
		sentAt: Date,
		error: String
	}

}, { _id: false });


// --------------------------------------------------
// Main Notification Schema
// --------------------------------------------------
const notificationSchema = new mongoose.Schema({

	// 🔗 User
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true
	},

	// 📝 Content
	title: {
		type: String,
		required: true,
		trim: true
	},

	message: {
		type: String,
		required: true
	},

	type: {
		type: String,
		enum: [
			"payment_failed",
			"subscription_expiring_soon",
			"subscription_expiring_urgent",
			"subscription_expired",
			"subscription_activated",
			"subscription_renewed",
			"admin_message",
			"system_alert",
			"warning",

			//admin
			"admin_subscription_created",
            "announcement"
		],
		required: true,
		index: true
	},

	priority: {
		type: String,
		enum: ["low", "normal", "high", "critical"],
		default: "normal"
	},

	actionUrl: String,

	// Flexible metadata
	metadata: {
		type: mongoose.Schema.Types.Mixed,
		default: {}
	},

	// 🔵 In-app read
	isRead: {
		type: Boolean,
		default: false,
		index: true
	},

	// 🔥 Multi-channel delivery tracking
	channels: {
		type: channelStatusSchema,
		default: () => ({})
	},

	// Optional grouping
	groupKey: {
		type: String,
		index: true
	},
	expiryReminderSent: { 
		type: Boolean, 
		default: false 
	},
	urgentReminderSent: { 
		type: Boolean, 
		default: false 
	},


	// Auto expiry (30 days)
	expiresAt: {
		type: Date,
		default: () =>
			new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		index: { expires: "0s" }
	},

	// Soft delete (enterprise safe)
	isDeleted: {
		type: Boolean,
		default: false
	}

}, { timestamps: true });


// Compound index for fast unread queries
notificationSchema.index({ user: 1, isRead: 1 });


module.exports =
	mongoose.models.Notification ||
	mongoose.model("Notification", notificationSchema);
