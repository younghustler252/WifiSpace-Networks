import mongoose from "mongoose";
import {
	ACCOUNT_TYPE_LIST,
	APPROVAL_STATUS_LIST,
	SERVICE_TYPE_LIST
} from "../domain/account.enum.js";

const accountSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},

		accountType: {
			type: String,
			enum: ACCOUNT_TYPE_LIST,
			default: "personal"
		},

		businessName: {
			type: String,
			trim: true
		},

		companyRegistrationNumber: {
			type: String,
			trim: true
		},

		taxId: {
			type: String,
			trim: true
		},

		wsnId: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},

		routerPassword: {
			type: String
		},

		routerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Router"
		},

		routerProfile: {
			type: String,
			default: "default"
		},

		devices: [
			{
				macAddress: {
					type: String,
					uppercase: true,
					trim: true
				},
				hostname: {
					type: String
				},
				lastSeenAt: {
					type: Date
				}
			}
		],

		serviceType: {
			type: String,
			enum: SERVICE_TYPE_LIST,
			default: "pppoe"
		},

		approvalStatus: {
			type: String,
			enum: APPROVAL_STATUS_LIST,
			default: "approved"
		},

		approvalNote: {
			type: String,
			default: null
		},

		approvedAt: {
			type: Date,
			default: null
		},

		approvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null
		},

		limitUptime: {
			type: String,
			default: "0"
		}
	},
	{
		timestamps: true
	}
);

accountSchema.index({ userId: 1 });
accountSchema.index({ userId: 1, serviceType: 1 });
accountSchema.index({ routerId: 1 });
accountSchema.index({ routerProfile: 1 });
accountSchema.index({ approvalStatus: 1 });
accountSchema.index({ "devices.macAddress": 1 });
accountSchema.index({ "devices.lastSeenAt": -1 });

export default mongoose.model("Account", accountSchema);