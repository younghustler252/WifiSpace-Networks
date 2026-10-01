// database/usage.model.js
import mongoose from "mongoose";
import { USAGE_SOURCE_LIST } from "../domain/usage.enum.js";

const usageSchema = new mongoose.Schema(
	{
		subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
		accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
		routerId: { type: mongoose.Schema.Types.ObjectId, ref: "Router", default: null },
		macAddress: { type: String, default: null, uppercase: true, trim: true },

		bytesUsed: { type: Number, default: 0, min: 0 },
		secondsUsed: { type: Number, default: 0, min: 0 },
		source: { type: String, enum: USAGE_SOURCE_LIST, default: "mikrotik_sync" },

		recordedAt: { type: Date, default: Date.now },
		metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
	},
	{ timestamps: { createdAt: true, updatedAt: false } } // append-only — no updatedAt needed
);

usageSchema.index({ subscriptionId: 1, recordedAt: -1 });

export default mongoose.model("Usage", usageSchema);