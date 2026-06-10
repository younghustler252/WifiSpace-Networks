import { ValidationError } from "../../../shared/errors/validation-error.js";

import {
	PAYMENT_STATUSES,
	PAYMENT_CHANNELS,
	PAYMENT_GATEWAYS,
	PAYMENT_ACTIONS
} from "./payment.enum.js";

// ==============================
// ENTITY
// ==============================

export class Payment {
	constructor({
		id,

		// RELATIONSHIPS
		userId,
		accountId,
		subscriptionId = null,
		planId,

		// ACTION
		actionType,

		// BILLING
		amount = {
			total: 0,
			base: 0,
			discount: 0
		},

		cycles = 1,
		currency = "NGN",

		// GATEWAY
		paymentChannel = null,
		gateway = "paystack",
		gatewayReference = null,

		// STATUS
		status = "initiated",
		processed = false,
		businessProcessed = false,
		isWebhookProcessed = false,

		// FAILURE
		processedAt = null,
		failedAt = null,
		failureReason = null,

		// SAFETY
		idempotencyKey = null,

		// EXTRA
		paymentDate = new Date(),
		metadata = {},

		// TIMESTAMPS
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

		// RELATIONSHIPS
		this.id = id;
		this.userId = userId;
		this.accountId = accountId;
		this.subscriptionId = subscriptionId;
		this.planId = planId;

		// ACTION
		this.actionType = actionType;

		// BILLING
		this.amount = amount;
		this.cycles = cycles;
		this.currency = currency;

		// GATEWAY
		this.paymentChannel = paymentChannel;
		this.gateway = gateway;
		this.gatewayReference = gatewayReference;

		// STATUS
		this.status = status;
		this.processed = processed;
		this.businessProcessed = businessProcessed;
		this.isWebhookProcessed = isWebhookProcessed;

		// FAILURE
		this.processedAt = processedAt
			? new Date(processedAt)
			: null;

		this.failedAt = failedAt
			? new Date(failedAt)
			: null;

		this.failureReason = failureReason;

		// SAFETY
		this.idempotencyKey = idempotencyKey;

		// EXTRA
		this.paymentDate = new Date(paymentDate);
		this.metadata = metadata;

		// TIMESTAMPS
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	// ==============================
	// VALIDATION
	// ==============================

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
			throw new ValidationError(
				"User ID required"
			);
		}

		// if (!accountId) {
		// 	throw new ValidationError(
		// 		"Account ID required"
		// 	);
		// }

		if (!planId) {
			throw new ValidationError(
				"Plan ID required"
			);
		}

		// if (
		// 	!amount ||
		// 	typeof amount.total !== "number" ||
		// 	amount.total <= 0
		// ) {
		// 	throw new ValidationError(
		// 		"Invalid total amount"
		// 	);
		// }

		if (
			typeof cycles !== "number" ||
			cycles < 1
		) {
			throw new ValidationError(
				"Cycles must be >= 1"
			);
		}

		if (
			paymentChannel &&
			!PAYMENT_CHANNELS.includes(paymentChannel)
		) {
			throw new ValidationError(
				"Invalid payment channel"
			);
		}

		if (
			!PAYMENT_STATUSES.includes(status)
		) {
			throw new ValidationError(
				"Invalid status"
			);
		}

		if (
			!PAYMENT_ACTIONS.includes(actionType)
		) {
			throw new ValidationError(
				"Invalid action type"
			);
		}

		if (
			!PAYMENT_GATEWAYS.includes(gateway)
		) {
			throw new ValidationError(
				"Invalid gateway"
			);
		}
	}

	// ==============================
	// STATUS HELPERS
	// ==============================

	isPending() {
		return [
			"initiated",
			"pending"
		].includes(this.status);
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

	// ==============================
	// STATE CHANGES
	// ==============================

	markSuccessful() {
		this.status = "successful";
		this.processed = true;

		this.processedAt = new Date();

		this.failedAt = null;
		this.failureReason = null;
	}

	markFailed(reason) {
		this.status = "failed";
		this.processed = false;

		this.failedAt = new Date();
		this.failureReason = reason;
	}

	markExpired() {
		this.status = "expired";
	}

	markPending() {
		this.status = "pending";

		this.processed = false;

		this.processedAt = null;
		this.failedAt = null;
		this.failureReason = null;
	}

	markWebhookProcessed() {
		this.isWebhookProcessed = true;
	}

	markBusinessProcessed() {
		this.businessProcessed = true;
	}

	attachSubscription(subscriptionId) {

		if (!subscriptionId) {
			throw new ValidationError(
				"Subscription ID required"
			);
		}

		this.subscriptionId = subscriptionId;
	}

	// ==============================
	// METADATA HELPERS
	// ==============================

	get autoRenewEnabled() {
		return (
			this.metadata.autoRenewEnabled || false
		);
	}

	get authorizationReusable() {
		return (
			this.metadata.authorizationReusable || false
		);
	}
}