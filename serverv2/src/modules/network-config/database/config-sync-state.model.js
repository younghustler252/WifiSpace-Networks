import mongoose from "mongoose";
import { RESOURCE_TYPE_LIST, SYNC_STATUSES } from "../domain/network-config.enum.js";

const configSyncStateSchema = new mongoose.Schema(
	{
		routerId: { type: mongoose.Schema.Types.ObjectId, ref: "Router", required: true },
		resourceType: { type: String, enum: RESOURCE_TYPE_LIST, required: true },
		status: { type: String, enum: Object.values(SYNC_STATUSES), default: SYNC_STATUSES.NEVER },
		lastRunAt: { type: Date, default: null },
		lastSuccessAt: { type: Date, default: null },
		error: { type: String, default: null },
		counts: { type: mongoose.Schema.Types.Mixed, default: {} },
		failures: { type: [mongoose.Schema.Types.Mixed], default: [] }
	},
	{ timestamps: true }
);

configSyncStateSchema.index({ routerId: 1, resourceType: 1 }, { unique: true });

export default mongoose.model("ConfigSyncState", configSyncStateSchema);
