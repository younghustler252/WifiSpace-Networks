import mongoose from "mongoose";
import { WALLED_GARDEN_KIND_LIST } from "../domain/network-config.enum.js";

const walledGardenEntrySchema = new mongoose.Schema(
	{
		kind: { type: String, enum: WALLED_GARDEN_KIND_LIST, required: true },
		dstHost: { type: String, default: null, trim: true },
		dstAddress: { type: String, default: null, trim: true },
		protocol: { type: String, default: null },
		dstPort: { type: String, default: null },
		path: { type: String, default: null },
		action: { type: String, required: true },
		description: { type: String, default: null },
		enabled: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		deletedAt: { type: Date, default: null, index: true }
	},
	{ timestamps: true }
);

export default mongoose.model("WalledGardenEntry", walledGardenEntrySchema);
