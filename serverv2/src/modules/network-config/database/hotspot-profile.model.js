import mongoose from "mongoose";
import { OPEN_STATUS_PAGE_VALUES } from "../domain/network-config.enum.js";

const hotspotProfileSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		uploadMbps: { type: Number, required: true, min: 1 },
		downloadMbps: { type: Number, required: true, min: 1 },
		sharedUsers: { type: Number, default: 1, min: 1 },
		macCookieTimeout: { type: String, default: "3d" },
		idleTimeout: { type: String, default: "none" },
		statusAutorefresh: { type: String, default: "1m" },
		addMacCookie: { type: Boolean, default: true },
		transparentProxy: { type: Boolean, default: true },
		openStatusPage: { type: String, enum: OPEN_STATUS_PAGE_VALUES, default: "always" },
		advertise: { type: Boolean, default: false },
		description: { type: String, default: null },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		deletedAt: { type: Date, default: null, index: true }
	},
	{ timestamps: true }
);

hotspotProfileSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });

export default mongoose.model("HotspotProfile", hotspotProfileSchema);
