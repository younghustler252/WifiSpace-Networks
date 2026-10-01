// database/usage-summary.model.js
import mongoose from "mongoose";

const usageSummarySchema = new mongoose.Schema(
	{
		subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, unique: true },
		accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },

		totalBytesUsed: { type: Number, default: 0, min: 0 },
		totalSecondsUsed: { type: Number, default: 0, min: 0 },
		dataCapBytes: { type: Number, default: 0 },
		durationSeconds: { type: Number, default: 0 },

		lastSyncedAt: { type: Date, default: null }
	},
	{ timestamps: true }
);

export default mongoose.model("UsageSummary", usageSummarySchema);