import mongoose from "mongoose";
import { HOTSPOT_SESSION_STATUS_LIST } from "../domain/hotspot-session.enum.js";

const hotspotSessionSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
		accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null, index: true },
		routerId: { type: mongoose.Schema.Types.ObjectId, ref: "Router", required: true, index: true },

		macAddress: { type: String, required: true, trim: true, uppercase: true },
		ipAddress: { type: String, default: null },
		userAgent: { type: String, default: null },

		status: { type: String, enum: HOTSPOT_SESSION_STATUS_LIST, default: "pending", index: true },
		trustedDevice: { type: Boolean, default: false },

		lastSeenAt: { type: Date, default: Date.now },
		expiresAt: { type: Date, default: null }
	},
	{ timestamps: true, versionKey: false }
);

hotspotSessionSchema.index({ macAddress: 1 }, { unique: true });
hotspotSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const HotspotSessionModel = mongoose.model("HotspotSession", hotspotSessionSchema);