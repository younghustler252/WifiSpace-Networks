import mongoose from "mongoose";

const ACCOUNT_TYPES = ["personal", "business"];
const PROFILE_STATUSES = ["pending", "active", "suspended", "canceled"];
const SERVICE_TYPES = ["pppoe", "hotspot"];

const accountSchema = new mongoose.Schema({
    // Owner
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },

    // Account Type
    accountType: { 
        type: String, 
        enum: ACCOUNT_TYPES, 
        default: "personal" 
    },

    // Business Fields
    businessName: { type: String, trim: true },
    companyRegistrationNumber: { type: String, trim: true },
    taxId: { type: String, trim: true },

    // Network Identity
    wsnId: { type: String, required: true, unique: true, trim: true },
    routerPassword: { type: String },

    // Router Info
    routerId: { type: mongoose.Schema.Types.ObjectId, ref: "Router" },
    routerProfile: { type: String, default: "default" },
    devices: [
        {
        macAddress: {
            type: String,
            uppercase: true,
            trim: true
        },
        hostname: String,
        lastSeenAt: Date
    }
    ],
    // Service
    serviceType: { type: String, enum: SERVICE_TYPES, default: "pppoe" },
    profileStatus: { type: String, enum: PROFILE_STATUSES, default: "pending" },

    // Provisioning Status
    routerProvision: {
        status: { type: String, enum: ["pending", "synced", "failed"], default: "pending" },
        lastError: { type: String, default: null },
        lastAttemptAt: { type: Date }
    },

    // Monitoring
    limitUptime: { type: String, default: "0" },

}, { timestamps: true });

// Indexes
accountSchema.index({ userId: 1 });
accountSchema.index({ routerId: 1 });
accountSchema.index({ routerProfile: 1 });
accountSchema.index({ profileStatus: 1 });
accountSchema.index({ "devices.macAddress": 1 });

accountSchema.index({ "devices.lastSeenAt": -1 });
export default mongoose.model("Account", accountSchema);