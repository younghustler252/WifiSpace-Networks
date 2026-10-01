import { ValidationError } from "../../../shared/errors/domain.errors.js";
import { PAYMENT_STATUSES, PAYMENT_STATUS_LIST, PAYMENT_CHANNEL_LIST, PAYMENT_GATEWAY_LIST, PAYMENT_ACTION_LIST } from "./payment.enum.js";

export class Payment {
	constructor({
		id, userId, accountId, subscriptionId = null, planId, actionType,
		amount = { total: 0, base: 0, discount: 0 }, cycles = 1, currency = "NGN",
		paymentChannel = null, gateway = "paystack", gatewayReference = null,
		status = PAYMENT_STATUSES.INITIATED, businessProcessed = false,
		processedAt = null, failedAt = null, failureReason = null,
		idempotencyKey = null, paymentDate = new Date(), metadata = {},
		createdAt = null, updatedAt = null
	}) {
		this.validate({ userId, accountId, planId, amount, cycles, paymentChannel, status, actionType, gateway });

		Object.assign(this, {
			id, userId, accountId, subscriptionId, planId, actionType, amount, cycles, currency,
			paymentChannel, gateway, gatewayReference, status, businessProcessed,
			processedAt: processedAt ? new Date(processedAt) : null,
			failedAt: failedAt ? new Date(failedAt) : null,
			failureReason, idempotencyKey, paymentDate: new Date(paymentDate), metadata, createdAt, updatedAt
		});
	}

	validate({ userId, accountId, planId, amount, cycles, paymentChannel, status, actionType, gateway }) {
		if (!userId) throw new ValidationError("User ID required");
		if (!accountId) throw new ValidationError("Account ID required");
		if (!planId) throw new ValidationError("Plan ID required");

		if (!amount || typeof amount !== "object") throw new ValidationError("Amount is required");
		if (typeof amount.total !== "number" || amount.total < 0) throw new ValidationError("Invalid total amount");
		if (typeof amount.base !== "number" || amount.base < 0) throw new ValidationError("Invalid base amount");
		if (typeof amount.discount !== "number" || amount.discount < 0) throw new ValidationError("Invalid discount amount");

		// epsilon comparison — avoids float rounding false negatives (e.g. 0.1 + 0.2 !== 0.3)
		if (Math.abs(amount.total - (amount.base - amount.discount)) > 0.01) {
			throw new ValidationError("Amount total must equal base minus discount");
		}

		if (typeof cycles !== "number" || cycles < 1) throw new ValidationError("Cycles must be >= 1");
		if (paymentChannel && !PAYMENT_CHANNEL_LIST.includes(paymentChannel)) throw new ValidationError("Invalid payment channel");
		if (!PAYMENT_STATUS_LIST.includes(status)) throw new ValidationError("Invalid status");
		if (!PAYMENT_ACTION_LIST.includes(actionType)) throw new ValidationError("Invalid action type");
		if (!PAYMENT_GATEWAY_LIST.includes(gateway)) throw new ValidationError("Invalid gateway");
	}

	isPending() { return [PAYMENT_STATUSES.INITIATED, PAYMENT_STATUSES.PENDING].includes(this.status); }
	isSuccessful() { return this.status === PAYMENT_STATUSES.SUCCESSFUL; }
	isFailed() { return this.status === PAYMENT_STATUSES.FAILED; }
	isExpired() { return this.status === PAYMENT_STATUSES.EXPIRED; }

	markSuccessful() {
		this.status = PAYMENT_STATUSES.SUCCESSFUL;
		this.processedAt = new Date();
		this.failedAt = null;
		this.failureReason = null;
	}

	markFailed(reason) {
		this.status = PAYMENT_STATUSES.FAILED;
		this.failedAt = new Date();
		this.failureReason = reason;
	}

	markExpired() { this.status = PAYMENT_STATUSES.EXPIRED; }
	markBusinessProcessed() { this.businessProcessed = true; }

	attachSubscription(subscriptionId) {
		if (!subscriptionId) throw new ValidationError("Subscription ID required");
		this.subscriptionId = subscriptionId;
	}

	get totalAmount() { return this.amount.total; }
	get baseAmount() { return this.amount.base; }
	get discountAmount() { return this.amount.discount; }
	get autoRenewEnabled() { return this.metadata.autoRenewEnabled || false; }
	get authorizationReusable() { return this.metadata.authorizationReusable || false; }

	toJSON() { return { ...this }; }
}