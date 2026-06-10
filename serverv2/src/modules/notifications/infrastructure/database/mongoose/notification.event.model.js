import mongoose from "mongoose";
import {
    NOTIFICATION_TYPES,
    NOTIFICATION_CHANNEL
} from "../../../domain/notification.enum.js";

const notificationSchema = new mongoose.Schema({

    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        index: true
    },

    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        index: true
    },

    createdByAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },

    type: {
        type: String,
        enum: Object.values(NOTIFICATION_TYPES),
        required: true,
        index: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    // notification lifecycle
    state: {
        type: String,
        enum: [
            "DRAFT",
            "QUEUED",
            "PROCESSING",
            "COMPLETED",
            "CANCELLED"
        ],
        default: "QUEUED",
        index: true
    },

    // default delivery channel
    channel: {
        type: String,
        enum: Object.values(NOTIFICATION_CHANNEL),
        default: NOTIFICATION_CHANNEL.EMAIL
    },

    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    sentAt: Date,

    completedAt: Date,

    cancelledAt: Date,

    isArchived: {
        type: Boolean,
        default: false,
        index: true
    }

}, {
    timestamps: true
});


// ================= INDEXES =================

notificationSchema.index({
    createdAt: -1
});

notificationSchema.index({
    createdByAdminId: 1,
    createdAt: -1
});

notificationSchema.index({
    type: 1,
    createdAt: -1
});

notificationSchema.index({
    state: 1,
    createdAt: 1
});


export default mongoose.model(
    "Notification",
    notificationSchema
);