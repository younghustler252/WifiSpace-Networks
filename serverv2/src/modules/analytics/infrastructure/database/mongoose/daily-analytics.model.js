import mongoose from "mongoose";

const dailyAnalyticsSchema = new mongoose.Schema(
	{
		date: {
			type: String,
			required: true,
		},

		// USERS
		newUsers: { type: Number, default: 0 },
		activeUsers: { type: Number, default: 0 },

		// ACCOUNTS
		newAccounts: { type: Number, default: 0 },

		// SUBSCRIPTIONS
		newSubscriptions: { type: Number, default: 0 },
		activeSubscriptions: { type: Number, default: 0 },
		expiredSubscriptions: { type: Number, default: 0 },

		// PAYMENTS
		totalPayments: { type: Number, default: 0 },
		successfulPayments: { type: Number, default: 0 },
		failedPayments: { type: Number, default: 0 },

		// MONEY
		totalRevenue: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

dailyAnalyticsSchema.index({ date: 1 });

export default mongoose.model("DailyAnalytics", dailyAnalyticsSchema);