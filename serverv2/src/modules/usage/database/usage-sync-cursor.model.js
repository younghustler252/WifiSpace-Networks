import mongoose from "mongoose";

// Internal job bookkeeping only — never exposed via API, no entity/mapper.
// Tracks the last-seen RouterOS cumulative counters per (router, username)
// so the sync job can compute deltas instead of re-recording the full
// cumulative total every tick.
const usageSyncCursorSchema = new mongoose.Schema(
	{
		subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
		accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
		routerId: { type: mongoose.Schema.Types.ObjectId, ref: "Router", required: true },
		username: { type: String, required: true }, // wsnId — same value used as RouterOS login for both PPPoE and hotspot

		lastBytes: { type: Number, default: 0 },
		lastSeconds: { type: Number, default: 0 },
		lastSyncedAt: { type: Date, default: null }
	},
	{ timestamps: true }
);

usageSyncCursorSchema.index({ routerId: 1, username: 1 }, { unique: true });

export default mongoose.model("UsageSyncCursor", usageSyncCursorSchema);