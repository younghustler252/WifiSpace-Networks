import mongoose from "mongoose";
import {
	PAYMENT_STATUSES,
	PAYMENT_CHANNELS,
	PAYMENT_GATEWAYS,
	PAYMENT_ACTIONS
} from "../../../domain/payment.enum.js";

const PaymentSchema = new mongoose.Schema(
	{
		// ===========================
		// RELATIONSHIPS
		// ===========================
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true
		},

		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			required: true,
			index: true
		},

		subscriptionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Subscription"
		},

		// ===========================
		// ACTION TYPE
		// ===========================
		actionType: {
			type: String,
			enum: PAYMENT_ACTIONS,
			required: true
		},

		// ===========================
		// MONEY (CLEAN + FUTURE PROOF)
		// ===========================
		amount: {
			total: {
				type: Number,
				required: true,
				min: 0
			},
			base: {
				type: Number,
				required: true,
				min: 0
			},
			discount: {
				type: Number,
				default: 0
			}
		},

		currency: {
			type: String,
			default: "NGN"
		},

		// ===========================
		// PAYMENT STATE
		// ===========================
		status: {
			type: String,
			enum: PAYMENT_STATUSES,
			default: "initiated",
			index: true
		},

		paymentChannel: {
			type: String,
			enum: PAYMENT_CHANNELS,
			default: null
		},

		gateway: {
			type: String,
			enum: PAYMENT_GATEWAYS,
			default: "paystack"
		},

		gatewayReference: {
			type: String,
			unique: true,
			sparse: true,
			index: true
		},

		// ===========================
		// SAFETY (CRITICAL FOR ISP)
		// ===========================
		idempotencyKey: {
			type: String,
		},

		isWebhookProcessed: {
			type: Boolean,
			default: false,
			index: true
		},

		// ===========================
		// PLAN REFERENCE
		// ===========================
		planId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Plan"
		},

		// ===========================
		// GATEWAY RESPONSE
		// ===========================
		metadata: {
			type: mongoose.Schema.Types.Mixed,
			default: {}
		},

		// ===========================
		// TIMING
		// ===========================
		paymentDate: {
			type: Date,
			default: Date.now
		},

		processedAt: Date,
		failedAt: Date,
		failureReason: String
	},
	{
		timestamps: true
	}
);

// ===========================
// INDEXES
// ===========================
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ accountId: 1, createdAt: -1 });
PaymentSchema.index({ idempotencyKey: 1 });

export default mongoose.model("Payment", PaymentSchema);