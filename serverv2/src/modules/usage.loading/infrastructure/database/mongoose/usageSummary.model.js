import mongoose from "mongoose";

const UsageSummarySchema = new mongoose.Schema(
{
	accountId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account",
		index: true
	},

	subscriptionId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subscription",
		index: true
	},

	routerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Router",
		index: true
	},

	periodType: {
		type: String,
		enum: ["daily", "weekly", "monthly"],
		required: true,
		index: true
	},

	period: {
		type: String,
		required: true,
		index: true
	},

	totalBytesIn: {
		type: Number,
		default: 0
	},

	totalBytesOut: {
		type: Number,
		default: 0
	},

	totalSessionTime: {
		type: Number,
		default: 0
	},

	sessionCount: {
		type: Number,
		default: 0
	}
},
{ timestamps: true }
);

UsageSummarySchema.index(
	{ subscriptionId: 1, periodType: 1, period: 1 },
	{ unique: true, partialFilterExpression: { subscriptionId: { $exists: true } } }
);

UsageSummarySchema.index(
	{ accountId: 1, periodType: 1, period: 1 },
	{ unique: true, partialFilterExpression: { accountId: { $exists: true } } }
);


UsageSummarySchema.index({ routerId: 1, periodType: 1, period: 1 });

export const UsageSummaryModel = mongoose.model(
	"UsageSummary",
	UsageSummarySchema
);