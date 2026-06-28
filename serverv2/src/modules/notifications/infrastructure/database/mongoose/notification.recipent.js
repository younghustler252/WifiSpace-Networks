import mongoose from "mongoose";

const notificationRecipientSchema = new mongoose.Schema({
    notificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    channel: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"],
        default: "NORMAL",
        index: true
    },
    status: {
        type: String,
        enum: ["PENDING", "QUEUED", "SENT", "DELIVERED", "READ", "FAILED", "CANCELLED"],
        default: "PENDING",
        index: true
    },
    retryCount: {
        type: Number,
        default: 0
    },
    maxRetries: {
        type: Number,
        default: 3
    },
    nextRetryAt: {
        type: Date,
        index: true
    },
    queuedAt: Date,
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    failedAt: Date,
    cancelledAt: Date,
    failedReason: {
        type: String,
        trim: true
    },
    providerMessageId: {
        type: String,
        index: true
    },
    providerResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isArchived: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

notificationRecipientSchema.index(
    { notificationId: 1, userId: 1, channel: 1 },
    { unique: true }
);

notificationRecipientSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationRecipientSchema.index({ status: 1, nextRetryAt: 1 });
notificationRecipientSchema.index({ notificationId: 1, status: 1 });
notificationRecipientSchema.index({ status: 1, priority: 1, createdAt: 1 });

export default mongoose.model("NotificationRecipient", notificationRecipientSchema);
