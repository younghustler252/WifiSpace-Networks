import mongoose from "mongoose";

const UsageSnapshotSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        unique: true,
        index: true
    },

    routerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Router",
        required: true,
        index: true
    },

    wsnId: {
        type: String,
        required: true,
        index: true
    },

    online: {
        type: Boolean,
        default: false
    },

    ipAddress: String,

    macAddress: String,

    uptime: {
        type: String,
        default: "0s"
    },

    downloadBytes: {
        type: Number,
        default: 0
    },

    uploadBytes: {
        type: Number,
        default: 0
    },

    lastSeenAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model(
    "UsageSnapshot",
    UsageSnapshotSchema
);