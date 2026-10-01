// database/account.model.js
import mongoose from "mongoose";
import { ACCOUNT_TYPE_LIST, APPROVAL_STATUS_LIST, ACCOUNT_STATUS_LIST } from "../domain/account.enum.js";

const accountSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		wsnId: { type: String, required: true, unique: true, trim: true },
		accountType: { type: String, enum: ACCOUNT_TYPE_LIST, default: "personal" },
		businessName: { type: String, trim: true },
		companyRegistrationNumber: { type: String, trim: true },
		taxId: { type: String, trim: true },

		status: { type: String, enum: ACCOUNT_STATUS_LIST, default: "active", index: true },
		approvalStatus: { type: String, enum: APPROVAL_STATUS_LIST, default: "approved", index: true },
		approvalNote: { type: String, default: null },
		approvedAt: { type: Date, default: null },
		approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		deletedAt: { type: Date, default: null, index: true },

		devices: [{
			macAddress: { type: String, uppercase: true, trim: true },
			hostname: String,
			lastSeenAt: Date
		}]
	},
	{ timestamps: true, discriminatorKey: "serviceType" }
);

accountSchema.index({ userId: 1, serviceType: 1 });
accountSchema.index({ "devices.macAddress": 1 });

export default mongoose.model("Account", accountSchema);