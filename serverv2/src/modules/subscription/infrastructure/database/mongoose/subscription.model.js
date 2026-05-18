import mongoose from "mongoose";

const SUBSCRIPTION_STATUSES = ["pending", "active", "suspended", "expired", "canceled"];
const SUBSCRIPTION_EVENTS = ["created","activated","renewed","suspended","resumed","expired","canceled","manual_adjustment"];
const RENEWAL_STRATEGIES = ["manual","auto_renew","invoice"];

const SubscriptionSchema = new mongoose.Schema({
	accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
	planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

	status: { type: String, enum: SUBSCRIPTION_STATUSES, default: "pending", index: true },

	planSnapshot: {
		name: { type: String, required: true },
		serviceType: { type: String, enum: ["pppoe","hotspot"], required: true },
		price: { type: Number, required: true },
		durationValue: { type: Number, required: true },
		durationUnit: { type: String, enum: ["minutes","hours","days","months"], required: true },
		speedRate: String,
		mikrotikProfile: String,
		devicesAllowed: { type: Number, default: 1 },
		gracePeriodDays: { type: Number, default: 0 }
	},

	cycles: { type: Number, default: 1, min: 1 },
	totalAmount: { type: Number, required: true },

	startsAt: Date,
	expiresAt: { type: Date, required: true },
	graceEndsAt: Date,
	activatedAt: Date,
	expiredAt: Date,
	currentPeriodStart: Date,
	currentPeriodEnd: Date,

	renewalStrategy: { type: String, enum: RENEWAL_STRATEGIES, default: "manual", index: true },
	autoRenewEnabled: { type: Boolean, default: false, index: true },
	nextRenewalDate: { type: Date, index: true },
	lastRenewedAt: Date,

	lastPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
	lastPaymentDate: Date,
	lastPaymentAmount: Number,

	suspendedAt: Date,
	totalSuspendedDuration: { type: Number, default: 0 },
	suspensionReason: String,

	canceledAt: Date,
	cancellationReason: String,

	bonusDays: { type: Number, default: 0 },
	manualAdjustmentDays: { type: Number, default: 0 },

	mikrotikStatus: { type: String, enum: ["pending","synced","failed"], default: "pending", index: true },
	mikrotikLastSyncAt: Date,
	mikrotikError: String,

	events: [
		{
			type: { type: String, enum: SUBSCRIPTION_EVENTS },
			date: { type: Date, default: Date.now },
			metadata: mongoose.Schema.Types.Mixed
		}
	]
}, { timestamps: true });

// INDEXES
SubscriptionSchema.index({ accountId: 1 }, { unique: true, partialFilterExpression: { status: "active" } });
SubscriptionSchema.index({ autoRenewEnabled: 1, nextRenewalDate: 1, status: 1 });
SubscriptionSchema.index({ expiresAt: 1 });

export default mongoose.model("Subscription", SubscriptionSchema);