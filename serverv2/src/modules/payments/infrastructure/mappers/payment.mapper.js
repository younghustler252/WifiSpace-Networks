import { Payment } from "../../domain/payment.entity.js";

export class PaymentMapper {
	static toDomain(doc) {
		if (!doc) return null;

		return new Payment({
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
			businessProcessed: doc.businessProcessed,
			paymentDate: doc.paymentDate,
			processedAt: doc.processedAt,
			failedAt: doc.failedAt,
			failureReason: doc.failureReason,
			idempotencyKey: doc.idempotencyKey,
			metadata: doc.metadata || {},
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt
		});
	}

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
			businessProcessed: payment.businessProcessed,
			paymentDate: payment.paymentDate,
			processedAt: payment.processedAt,
			failedAt: payment.failedAt,
			failureReason: payment.failureReason,
			idempotencyKey: payment.idempotencyKey,
			metadata: payment.metadata
		};
	}

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
			businessProcessed: doc.businessProcessed,
			paymentDate: doc.paymentDate,
			processedAt: doc.processedAt,
			failedAt: doc.failedAt,
			failureReason: doc.failureReason,
			metadata: doc.metadata,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt
		};
	}
}