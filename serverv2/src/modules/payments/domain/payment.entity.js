import { ValidationError } from "../../../shared/errors/validation-error.js";
import {
	PAYMENT_STATUSES,
	PAYMENT_CHANNELS,
	PAYMENT_GATEWAYS,
	PAYMENT_ACTIONS
} from "./payment.enum.js";

export class Payment {
	constructor({
		id,
		userId,
		accountId,
		subscriptionId = null,
		planId,
		actionType,
		amount = {
			total: 0,
			base: 0,
			discount: 0
		},
		cycles = 1,
		currency = "NGN",
		paymentChannel = null,
		gateway = "paystack",
		gatewayReference = null,
		status = "initiated",
		businessProcessed = false,
		processedAt = null,
		failedAt = null,
		failureReason = null,
		idempotencyKey = null,
		paymentDate = new Date(),
		metadata = {},
		createdAt = null,
		updatedAt = null
	}) {
		this.validate({
			userId,
			accountId,
			planId,
			amount,
			cycles,
			paymentChannel,
			status,
			actionType,
			gateway
		});

		this.id = id;
		this.userId = userId;
		this.accountId = accountId;
		this.subscriptionId = subscriptionId;
		this.planId = planId;
		this.actionType = actionType;
		this.amount = amount;
		this.cycles = cycles;
		this.currency = currency;
		this.paymentChannel = paymentChannel;
		this.gateway = gateway;
		this.gatewayReference = gatewayReference;
		this.status = status;
		this.businessProcessed = businessProcessed;
		this.processedAt = processedAt ? new Date(processedAt) : null;
		this.failedAt = failedAt ? new Date(failedAt) : null;
		this.failureReason = failureReason;
		this.idempotencyKey = idempotencyKey;
		this.paymentDate = new Date(paymentDate);
		this.metadata = metadata;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	validate({
		userId,
		accountId,
		planId,
		amount,
		cycles,
		paymentChannel,
		status,
		actionType,
		gateway
	}) {
		if (!userId) {
			throw new ValidationError("User ID required");
		}

		if (!accountId) {
			throw new ValidationError("Account ID required");
		}

		if (!planId) {
			throw new ValidationError("Plan ID required");
		}

		if (!amount || typeof amount !== "object") {
			throw new ValidationError("Amount is required");
		}

		if (typeof amount.total !== "number" || amount.total < 0) {
			throw new ValidationError("Invalid total amount");
		}

		if (typeof amount.base !== "number" || amount.base < 0) {
			throw new ValidationError("Invalid base amount");
		}

		if (typeof amount.discount !== "number" || amount.discount < 0) {
			throw new ValidationError("Invalid discount amount");
		}

		if (amount.total !== amount.base - amount.discount) {
			throw new ValidationError(
				"Amount total must equal base minus discount"
			);
		}

		if (typeof cycles !== "number" || cycles < 1) {
			throw new ValidationError("Cycles must be >= 1");
		}

		// if (
		// 	paymentChannel &&
		// 	!PAYMENT_CHANNELS.includes(paymentChannel)
		// ) {
		// 	throw new ValidationError("Invalid payment channel");
		// }

		if (!PAYMENT_STATUSES.includes(status)) {
			throw new ValidationError("Invalid status");
		}

		if (!PAYMENT_ACTIONS.includes(actionType)) {
			throw new ValidationError("Invalid action type");
		}

		if (!PAYMENT_GATEWAYS.includes(gateway)) {
			throw new ValidationError("Invalid gateway");
		}
	}

	isPending() {
		return ["initiated", "pending"].includes(this.status);
	}

	isSuccessful() {
		return this.status === "successful";
	}

	isFailed() {
		return this.status === "failed";
	}

	isExpired() {
		return this.status === "expired";
	}

	markSuccessful() {
		this.status = "successful";
		this.processedAt = new Date();
		this.failedAt = null;
		this.failureReason = null;
	}

	markFailed(reason) {
		this.status = "failed";
		this.failedAt = new Date();
		this.failureReason = reason;
	}

	markExpired() {
		this.status = "expired";
	}

	markPending() {
		this.status = "pending";
		this.processedAt = null;
		this.failedAt = null;
		this.failureReason = null;
	}

	markBusinessProcessed() {
		this.businessProcessed = true;
	}

	attachSubscription(subscriptionId) {
		if (!subscriptionId) {
			throw new ValidationError("Subscription ID required");
		}

		this.subscriptionId = subscriptionId;
	}

	get totalAmount() {
		return this.amount.total;
	}

	get baseAmount() {
		return this.amount.base;
	}

	get discountAmount() {
		return this.amount.discount;
	}

	get autoRenewEnabled() {
		return this.metadata.autoRenewEnabled || false;
	}

	get authorizationReusable() {
		return this.metadata.authorizationReusable || false;
	}
}