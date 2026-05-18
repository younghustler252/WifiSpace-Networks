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
        userId,
        accountId,
        subscriptionId = null,
        planId,
        actionType,
        amount = { total: 0, base: 0, discount: 0 },
        currency = "NGN",
        paymentChannel = null,
        gateway = "paystack",
        gatewayReference = null,
        status = "initiated",
        processed = false,
        processedAt = null,
        failedAt = null,
        failureReason = null,
        idempotencyKey = null,
        isWebhookProcessed = false,
        paymentDate = new Date(),
        metadata = {},
        createdAt = null,
        updatedAt = null
    }) {
        this.validate({ userId, accountId, planId, amount, paymentChannel, status, actionType, gateway });

        this.id = id;
        this.userId = userId;
        this.accountId = accountId;
        this.subscriptionId = subscriptionId;
        this.planId = planId;
        this.actionType = actionType;
        this.amount = amount;
        this.currency = currency;
        this.paymentChannel = paymentChannel;
        this.gateway = gateway;
        this.gatewayReference = gatewayReference;
        this.status = status;
        this.processed = processed;
        this.processedAt = processedAt ? new Date(processedAt) : null;
        this.failedAt = failedAt ? new Date(failedAt) : null;
        this.failureReason = failureReason;
        this.idempotencyKey = idempotencyKey;
        this.isWebhookProcessed = isWebhookProcessed;
        this.paymentDate = new Date(paymentDate);
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    validate({ userId, accountId, planId, amount, paymentChannel, status, actionType, gateway }) {
        if (!userId) throw new ValidationError("User ID required");
        if (!accountId) throw new ValidationError("Account ID required");
        if (!planId) throw new ValidationError("Plan ID required");
        if (!amount || typeof amount.total !== "number" || amount.total <= 0) throw new ValidationError("Invalid total amount");
        if (paymentChannel && !PAYMENT_CHANNELS.includes(paymentChannel)) throw new ValidationError("Invalid payment channel");
        if (!PAYMENT_STATUSES.includes(status)) throw new ValidationError("Invalid status");
        if (!PAYMENT_ACTIONS.includes(actionType)) throw new ValidationError("Invalid action type");
        if (!PAYMENT_GATEWAYS.includes(gateway)) throw new ValidationError("Invalid gateway");
    }

    // Status helpers
    isPending() { return this.status === "pending"; }
    isSuccessful() { return this.status === "successful"; }
    isFailed() { return this.status === "failed"; }
    isExpired() { return this.status === "expired"; }

    // State changes
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

    attachSubscription(subscriptionId) {
        if (!subscriptionId) throw new ValidationError("Subscription ID required");
        this.subscriptionId = subscriptionId;
    }

    // Metadata helpers
    get autoRenewEnabled() { return this.metadata.autoRenewEnabled || false; }
    get authorizationReusable() { return this.metadata.authorizationReusable || false; }
}