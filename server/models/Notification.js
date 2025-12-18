const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
        type: String,
        enum: [
            "payment_success",
            "payment_failed",
            "subscription_expired",
            "subscription_activated",
            "subscription_renewed",
            "admin_message",
            "system_alert",
            "warning"
        ],
        required: true,
        index: true
    },

    // ⭐ Priority for real apps
    priority: {
        type: String,
        enum: ["low", "normal", "high", "critical"],
        default: "normal",
    },

    // ⭐ Optional action when user clicks
    actionUrl: { type: String },

    // ⭐ Extra data (invoice ID, subscription ID, etc.)
    metadata: { type: Object, default: {} },

    // ⭐ Read status
    isRead: { type: Boolean, default: false },

    // ⭐ Delivery status (useful for socket, push, email)
    status: {
        type: String,
        enum: ["pending", "delivered", "failed"],
        default: "delivered"
    },

    // ⭐ Auto-expire old notifications
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        index: { expires: "0s" }
    }

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
