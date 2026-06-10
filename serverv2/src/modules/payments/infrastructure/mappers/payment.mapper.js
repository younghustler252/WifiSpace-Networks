import { Payment } from "../../domain/payment.entity.js";

export class PaymentMapper {

	// =================================
	// Mongo → Domain
	// =================================

	static toDomain(doc) {
		if (!doc) return null;

		return new Payment({

			// -------------------------
			// Identity
			// -------------------------
			id: doc._id?.toString(),

			// -------------------------
			// Relationships
			// -------------------------
			userId: doc.userId,
			accountId: doc.accountId,
			subscriptionId: doc.subscriptionId,

			// -------------------------
			// Plan
			// -------------------------
			planId: doc.planId,

			// -------------------------
			// ACTION
			// -------------------------
			actionType: doc.actionType,

			// -------------------------
			// BILLING
			// -------------------------
			amount: doc.amount,
			currency: doc.currency,
			cycles: doc.cycles,

			// -------------------------
			// PAYMENT CHANNEL
			// -------------------------
			paymentChannel: doc.paymentChannel,

			// -------------------------
			// GATEWAY
			// -------------------------
			gateway: doc.gateway,
			gatewayReference: doc.gatewayReference,

			// -------------------------
			// STATUS
			// -------------------------
			status: doc.status,
			processed: doc.processed,
			businessProcessed: doc.businessProcessed,
			isWebhookProcessed: doc.isWebhookProcessed,

			// -------------------------
			// TIMING
			// -------------------------
			paymentDate: doc.paymentDate,
			processedAt: doc.processedAt,
			failedAt: doc.failedAt,
			failureReason: doc.failureReason,

			// -------------------------
			// SAFETY
			// -------------------------
			idempotencyKey: doc.idempotencyKey,

			// -------------------------
			// METADATA
			// -------------------------
			metadata: doc.metadata || {},

			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt
		});
	}

	// =================================
	// Domain → Mongo
	// =================================

	static toPersistence(payment) {
		return {

			userId: payment.userId,
			accountId: payment.accountId,
			subscriptionId: payment.subscriptionId,

			planId: payment.planId,

			actionType: payment.actionType,

			amount: payment.amount,
			currency: payment.currency,
			cycles: payment.cycles,

			paymentChannel: payment.paymentChannel,

			gateway: payment.gateway,
			gatewayReference: payment.gatewayReference,

			status: payment.status,
			processed: payment.processed,
			businessProcessed: payment.businessProcessed,
			isWebhookProcessed: payment.isWebhookProcessed,

			paymentDate: payment.paymentDate,
			processedAt: payment.processedAt,
			failedAt: payment.failedAt,
			failureReason: payment.failureReason,

			idempotencyKey: payment.idempotencyKey,

			metadata: payment.metadata
		};
	}

	// =================================
	// Mongo → DTO
	// =================================

	static toDTO(doc) {
		if (!doc) return null;

		return {

			id: doc._id?.toString(),

			userId: doc.userId,
			accountId: doc.accountId,
			subscriptionId: doc.subscriptionId,

			planId: doc.planId,

			actionType: doc.actionType,

			amount: doc.amount,
			currency: doc.currency,
			cycles: doc.cycles,

			paymentChannel: doc.paymentChannel,

			gateway: doc.gateway,
			gatewayReference: doc.gatewayReference,

			status: doc.status,
			processed: doc.processed,
			businessProcessed: doc.businessProcessed,
			isWebhookProcessed: doc.isWebhookProcessed,

			paymentDate: doc.paymentDate,
			processedAt: doc.processedAt,
			failedAt: doc.failedAt,
			failureReason: doc.failureReason,

			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt
		};
	}
}