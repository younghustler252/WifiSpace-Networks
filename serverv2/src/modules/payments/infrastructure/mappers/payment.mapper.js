import { Payment } from "../../domain/payment.entity.js";

export class PaymentMapper {

	// =================================
	// Mongo → Domain
	// =================================

	static toDomain(doc) {
		if (!doc) return null;

		return new Payment({

			// ---------------------------------
			// Identity
			// ---------------------------------

			id: doc._id?.toString(),

			// ---------------------------------
			// Relationships
			// ---------------------------------

			userId: doc.userId,

			accountId: doc.accountId,

			subscriptionId:
				doc.subscriptionId,

			// ---------------------------------
			// Account Reference
			// ---------------------------------

			wsnId: doc.wsnId,

			// ---------------------------------
			// Plan
			// ---------------------------------

			planId: doc.planId,

			planSnapshot:
				doc.planSnapshot || {},

			// ---------------------------------
			// Payment Intent
			// ---------------------------------

			actionType:
				doc.actionType,

			// ---------------------------------
			// Billing
			// ---------------------------------

			amount: doc.amount,

			currency:
				doc.currency,

			cycles: doc.cycles,

			bonusDays:
				doc.bonusDays,

			// ---------------------------------
			// Payment Channel
			// ---------------------------------

			paymentChannel:
				doc.paymentChannel,

			// ---------------------------------
			// Renewal Strategy
			// ---------------------------------

			renewalStrategy:
				doc.renewalStrategy,

			// ---------------------------------
			// Auto Renew Metadata
			// ---------------------------------

			autoRenewEnabled:
				doc.autoRenewEnabled,

			authorizationCode:
				doc.authorizationCode,

			authorizationReusable:
				doc.authorizationReusable,

			nextBillingDate:
				doc.nextBillingDate,

			// ---------------------------------
			// Gateway
			// ---------------------------------

			gateway: doc.gateway,

			gatewayReference:
				doc.gatewayReference,

			// ---------------------------------
			// Status
			// ---------------------------------

			status: doc.status,

			processed:
				doc.processed,

			processedAt:
				doc.processedAt,

			failedAt:
				doc.failedAt,

			failureReason:
				doc.failureReason,

			// ---------------------------------
			// Dates
			// ---------------------------------

			paymentDate:
				doc.paymentDate,

			// ---------------------------------
			// Metadata
			// ---------------------------------

			metadata:
				doc.metadata || {},

			createdAt:
				doc.createdAt,

			updatedAt:
				doc.updatedAt
		});
	}

	// =================================
	// Domain → Mongo
	// =================================

	static toPersistence(payment) {
		return {

			// ---------------------------------
			// Relationships
			// ---------------------------------

			userId: payment.userId,

			accountId:
				payment.accountId,

			subscriptionId:
				payment.subscriptionId,

			// ---------------------------------
			// Account Reference
			// ---------------------------------

			wsnId: payment.wsnId,

			// ---------------------------------
			// Plan
			// ---------------------------------

			planId: payment.planId,

			planSnapshot:
				payment.planSnapshot,

			// ---------------------------------
			// Payment Intent
			// ---------------------------------

			actionType:
				payment.actionType,

			// ---------------------------------
			// Billing
			// ---------------------------------

			amount: payment.amount,

			currency:
				payment.currency,

			cycles: payment.cycles,

			bonusDays:
				payment.bonusDays,

			// ---------------------------------
			// Payment Channel
			// ---------------------------------

			paymentChannel:
				payment.paymentChannel,

			// ---------------------------------
			// Renewal Strategy
			// ---------------------------------

			renewalStrategy:
				payment.renewalStrategy,

			// ---------------------------------
			// Auto Renew Metadata
			// ---------------------------------

			autoRenewEnabled:
				payment.autoRenewEnabled,

			authorizationCode:
				payment.authorizationCode,

			authorizationReusable:
				payment.authorizationReusable,

			nextBillingDate:
				payment.nextBillingDate,

			// ---------------------------------
			// Gateway
			// ---------------------------------

			gateway:
				payment.gateway,

			gatewayReference:
				payment.gatewayReference,

			// ---------------------------------
			// Status
			// ---------------------------------

			status: payment.status,

			processed:
				payment.processed,

			processedAt:
				payment.processedAt,

			failedAt:
				payment.failedAt,

			failureReason:
				payment.failureReason,

			// ---------------------------------
			// Dates
			// ---------------------------------

			paymentDate:
				payment.paymentDate,

			// ---------------------------------
			// Metadata
			// ---------------------------------

			metadata:
				payment.metadata
		};
	}

	// =================================
	// Mongo → DTO
	// =================================

	static toDTO(doc) {
		if (!doc) return null;

		return {

			id: doc._id,

			// ---------------------------------
			// Relationships
			// ---------------------------------

			userId: doc.userId,

			accountId:
				doc.accountId,

			subscriptionId:
				doc.subscriptionId,

			// ---------------------------------
			// Account Reference
			// ---------------------------------

			wsnId: doc.wsnId,

			// ---------------------------------
			// Plan
			// ---------------------------------

			planId: doc.planId,

			planSnapshot:
				doc.planSnapshot,

			// ---------------------------------
			// Payment Intent
			// ---------------------------------

			actionType:
				doc.actionType,

			// ---------------------------------
			// Billing
			// ---------------------------------

			amount: doc.amount,

			currency:
				doc.currency,

			cycles: doc.cycles,

			bonusDays:
				doc.bonusDays,

			// ---------------------------------
			// Payment Channel
			// ---------------------------------

			paymentChannel:
				doc.paymentChannel,

			// ---------------------------------
			// Renewal Strategy
			// ---------------------------------

			renewalStrategy:
				doc.renewalStrategy,

			// ---------------------------------
			// Auto Renew Metadata
			// ---------------------------------

			autoRenewEnabled:
				doc.autoRenewEnabled,

			authorizationReusable:
				doc.authorizationReusable,

			nextBillingDate:
				doc.nextBillingDate,

			// ---------------------------------
			// Gateway
			// ---------------------------------

			gateway:
				doc.gateway,

			gatewayReference:
				doc.gatewayReference,

			// ---------------------------------
			// Status
			// ---------------------------------

			status: doc.status,

			processed:
				doc.processed,

			processedAt:
				doc.processedAt,

			failedAt:
				doc.failedAt,

			failureReason:
				doc.failureReason,

			// ---------------------------------
			// Dates
			// ---------------------------------

			paymentDate:
				doc.paymentDate,

			createdAt:
				doc.createdAt,

			updatedAt:
				doc.updatedAt
		};
	}
}