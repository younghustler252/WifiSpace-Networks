import mongoose from "mongoose";
import {
	SERVICE_TYPE_LIST, PLAN_ACCOUNT_TYPE_LIST, DURATION_UNIT_LIST,
	PLAN_STATUS_LIST, DISCOUNT_TYPE_LIST
} from "../domain/plan.enum.js";

const planSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },

		serviceType: { type: String, enum: SERVICE_TYPE_LIST, required: true },
		accountType: {
			type: String,
			enum: PLAN_ACCOUNT_TYPE_LIST,
			required: function () { return this.serviceType === "pppoe"; },
			default: null
		},

		price: { type: Number, required: true, min: 0 },
		speedRate: { type: String, required: true, trim: true },

		durationValue: { type: Number, required: true },
		durationUnit: { type: String, enum: DURATION_UNIT_LIST, default: "days" },

		dataLimitBytes: { type: Number, default: 0 },

		devicesAllowed: { type: Number, default: 1, min: 1 },
		features: { type: [String], default: [] },
		mikrotikProfile: { type: String, required: true, trim: true },
		gracePeriodDays: { type: Number, default: 0, min: 0 },

		discountType: { type: String, enum: DISCOUNT_TYPE_LIST, default: null },
		discountValue: { type: Number, default: 0 },
		discountValidUntil: { type: Date, default: null },

		status: { type: String, enum: PLAN_STATUS_LIST, default: "active", index: true },

		bonusRules: [{
			minCycles: { type: Number, required: true },
			bonusDays: { type: Number, required: true }
		}],

		deletedAt: { type: Date, default: null, index: true }
	},
	{ timestamps: true }
);

// Partial index — excludes soft-deleted plans, so a deleted plan's name can be reused.
planSchema.index(
	{ name: 1, serviceType: 1 },
	{ unique: true, partialFilterExpression: { deletedAt: null } }
);

export default mongoose.model("Plan", planSchema);