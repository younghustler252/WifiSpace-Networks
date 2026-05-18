import mongoose from "mongoose";
import { NOTIFICATION_TYPES, NOTIFICATION_STATUS, NOTIFICATION_CHANNEL } from "../../../domain/notification.enum.js";

const notificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        index: true 
        // optional for broadcast announcements
    },
    targetUsers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
        // for admin-created bulk notifications
    }],
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    
    createdByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // track admin who created it
    
    type: {
        type: String,
        enum: Object.values(NOTIFICATION_TYPES),
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: {
        type: String,
        enum: Object.values(NOTIFICATION_CHANNEL),
        required: true,
        default: NOTIFICATION_CHANNEL.EMAIL
    },
    status: {
        type: String,
        enum: Object.values(NOTIFICATION_STATUS),
        default: NOTIFICATION_STATUS.UNREAD,
        index: true
    },
    metadata: { type: mongoose.Schema.Types.Mixed }, // flexible extra info
    sentAt: { type: Date }
}, { timestamps: true });

// Index for unread notifications
notificationSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Notification", notificationSchema);