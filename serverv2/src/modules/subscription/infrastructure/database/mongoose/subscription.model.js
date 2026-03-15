import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
	{
		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			required: true,
			index: true
		},

		planId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Plan",
			required: true
		},

		startDate: {
			type: Date,
			required: true
		},

		endDate: {
			type: Date,
			required: true
		},

		status: {
			type: String,
			enum: ["active", "expired", "suspended", "canceled"],
			default: "active"
		},

		autoRenew: {
			type: Boolean,
			default: false
		},

		// Optional override if subscription uses a different router profile than account
		routerProfile: {
			type: String
		},

		// Payment reference
		paymentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment"
		},

		suspensionReason: {
			type: String
		}
	},
	{ timestamps: true }
);

// Index for quick queries on active subscriptions
SubscriptionSchema.index(
	{ accountId: 1, status: 1 },
	{ partialFilterExpression: { status: "active" } }
);

export default mongoose.model("Subscription", SubscriptionSchema);