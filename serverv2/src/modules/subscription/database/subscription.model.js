import mongoose from "mongoose";
import { SERVICE_TYPE_LIST } from "../../../shared/constants/service-type.enum.js";
import { DURATION_UNIT_LIST } from "../../plan/domain/plan.enum.js";
import { SUBSCRIPTION_STATUS_LIST, SUBSCRIPTION_EVENT_LIST, RENEWAL_STRATEGY_LIST, MIKROTIK_SYNC_STATUS_LIST } from "../domain/subscription.enum.js";

const subscriptionSchema = new mongoose.Schema(
	{
		accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

		status: { type: String, enum: SUBSCRIPTION_STATUS_LIST, default: "pending", index: true },

		planSnapshot: {
			name: { type: String, required: true },
			serviceType: { type: String, enum: SERVICE_TYPE_LIST, required: true },
			price: { type: Number, required: true },
			durationValue: { type: Number, required: true },
			durationUnit: { type: String, enum: DURATION_UNIT_LIST, required: true },
			speedRate: String,
			mikrotikProfile: String,
			ipoeProfile: { type: String, default: null },
			devicesAllowed: { type: Number, default: 1 },
			gracePeriodDays: { type: Number, default: 0 }
		},

		cycles: { type: Number, default: 1, min: 1 },
		totalAmount: { type: Number, required: true },

		startsAt: Date,
		expiresAt: {
			type: Date,
			default: null,
			required: function () {
				return this.status === "active";
			}
		},
		graceEndsAt: Date,
		activatedAt: Date,
		expiredAt: Date,
		currentPeriodStart: Date,
		currentPeriodEnd: Date,

		renewalStrategy: { type: String, enum: RENEWAL_STRATEGY_LIST, default: "manual", index: true },
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

		mikrotikStatus: { type: String, enum: MIKROTIK_SYNC_STATUS_LIST, default: "pending", index: true },
		mikrotikLastSyncAt: Date,
		mikrotikError: String,

		remindersSent: { type: [Number], default: [] },

		events: [{
			type: { type: String, enum: SUBSCRIPTION_EVENT_LIST },
			date: { type: Date, default: Date.now },
			metadata: mongoose.Schema.Types.Mixed
		}]
	},
	{ timestamps: true }
);

subscriptionSchema.index({ accountId: 1 }, { unique: true, partialFilterExpression: { status: "active" } });
subscriptionSchema.index({ autoRenewEnabled: 1, nextRenewalDate: 1, status: 1 });
subscriptionSchema.index({ expiresAt: 1 });

export default mongoose.model("Subscription", subscriptionSchema);