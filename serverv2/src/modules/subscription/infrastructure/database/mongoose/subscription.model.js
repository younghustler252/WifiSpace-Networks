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

        // 🔥 UPDATED PLAN SNAPSHOT
        planSnapshot: {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            // Match the new Plan structure
            durationValue: { type: Number, required: true },
            durationUnit: { type: String, required: true },
            speedRate: String,
            dataLimitBytes: { type: Number, default: 0 }, // Added for Hotspot
            mikrotikProfile: String, // Added to keep record of which profile was used
            devicesAllowed: Number
        },

        // -----------------------------
        // Billing & Cycles
        // -----------------------------
        billingCycle: {
            type: String,
            enum: ["hourly", "daily", "weekly", "monthly", "yearly"], // Added 'hourly'
            default: "monthly"
        },

		cycles: {
			type: Number,
			default: 1,
			min: 1
		},

		totalAmount: {
			type: Number,
			required: true
		},

		// -----------------------------
		// Adjustments
		// -----------------------------
		bonusDays: {
			type: Number,
			default: 0
		},

		manualAdjustmentDays: {
			type: Number,
			default: 0
		},

		// -----------------------------
		// Suspension
		// -----------------------------
		suspendedAt: Date,

		totalSuspendedDuration: {
			type: Number, // milliseconds
			default: 0
		},

		suspensionReason: String,

		// -----------------------------
		// Renewal
		// -----------------------------
		autoRenew: {
			type: Boolean,
			default: false
		},

		lastRenewedAt: Date,

		nextRenewalDate: Date,

		// -----------------------------
		// Cancellation
		// -----------------------------
		canceledAt: Date,

		cancellationReason: String,

		// -----------------------------
		// Grace period
		// -----------------------------
		gracePeriodDays: {
			type: Number,
			default: 0
		},

		// -----------------------------
		// Payments (history)
		// -----------------------------
		payments: [
			{
				paymentId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Payment"
				},
				amount: Number,
				date: Date
			}
		],

		// -----------------------------
		// Audit trail (VERY IMPORTANT)
		// -----------------------------
		events: [
			{
				type: {
					type: String,
					enum: [
						"created",
						"renewed",
						"suspended",
						"resumed",
						"canceled",
						"expired",
						"manual_adjustment"
					]
				},
				date: {
					type: Date,
					default: Date.now
				},
				metadata: mongoose.Schema.Types.Mixed
			}
		],

		// -----------------------------
		// Network integration
		// -----------------------------
		routerProfile: String
	},
	{ timestamps: true }
);

// 🔥 Enforce ONE active subscription per account (CRITICAL)
SubscriptionSchema.index(
	{ accountId: 1 },
	{
		unique: true,
		partialFilterExpression: { status: "active" }
	}
);

export default mongoose.model("Subscription", SubscriptionSchema);