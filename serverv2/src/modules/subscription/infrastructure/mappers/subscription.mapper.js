// src/infrastructure/mappers/subscription.mapper.js

import { Subscription } from "../../domain/subscription.entity.js";

export class SubscriptionMapper {

	// -----------------------------
	// Mongo → Domain
	// -----------------------------
	static toDomain(doc) {
		if (!doc) return null;

		return new Subscription({
			id: doc._id?.toString(),
			accountId: doc.accountId,
			planId: doc.planId,

			// Plan Snapshot (store historical data)
			planSnapshot: doc.planSnapshot,

			startDate: doc.startDate,
			baseEndDate: doc.baseEndDate,
			endDate: doc.endDate,

			status: doc.status,

			// Billing
			billingCycle: doc.billingCycle,
			cycles: doc.cycles,
			totalAmount: doc.totalAmount,

			// Adjustments
			bonusDays: doc.bonusDays,
			manualAdjustmentDays: doc.manualAdjustmentDays,

			// Suspension
			suspendedAt: doc.suspendedAt,
			totalSuspendedDuration: doc.totalSuspendedDuration,
			suspensionReason: doc.suspensionReason,

			// Renewal
			autoRenew: doc.autoRenew,
			lastRenewedAt: doc.lastRenewedAt,
			nextRenewalDate: doc.nextRenewalDate,

			// Cancellation
			canceledAt: doc.canceledAt,
			cancellationReason: doc.cancellationReason,

			// Grace period
			gracePeriodDays: doc.gracePeriodDays,

			// Payments history
			payments: doc.payments,

			// Audit trail
			events: doc.events,

			// Network integration
			routerProfile: doc.routerProfile
		});
	}

	// -----------------------------
	// Domain → Mongo
	// -----------------------------
	static toPersistence(entity) {
		return {
			accountId: entity.accountId,
			planId: entity.planId,

			// Plan Snapshot (store historical data)
			planSnapshot: entity.planSnapshot,

			startDate: entity.startDate,
			baseEndDate: entity.baseEndDate,
			endDate: entity.endDate,

			status: entity.status,

			// Billing
			billingCycle: entity.billingCycle,
			cycles: entity.cycles,
			totalAmount: entity.totalAmount,

			// Adjustments
			bonusDays: entity.bonusDays,
			manualAdjustmentDays: entity.manualAdjustmentDays,

			// Suspension
			suspendedAt: entity.suspendedAt,
			totalSuspendedDuration: entity.totalSuspendedDuration,
			suspensionReason: entity.suspensionReason,

			// Renewal
			autoRenew: entity.autoRenew,
			lastRenewedAt: entity.lastRenewedAt,
			nextRenewalDate: entity.nextRenewalDate,

			// Cancellation
			canceledAt: entity.canceledAt,
			cancellationReason: entity.cancellationReason,

			// Grace period
			gracePeriodDays: entity.gracePeriodDays,

			// Payments history
			payments: entity.payments,

			// Audit trail
			events: entity.events,

			// Network integration
			routerProfile: entity.routerProfile
		};
	}

	// -----------------------------
	// Mongo → DTO (API response)
	// -----------------------------
	static toDTO(doc) {
		if (!doc) return null;

		return {
			id: doc._id,
			accountId: doc.accountId,
			plan: doc.planId,

			// Plan Snapshot
			planSnapshot: doc.planSnapshot,

			startDate: doc.startDate,
			baseEndDate: doc.baseEndDate,
			endDate: doc.endDate,

			status: doc.status,

			// Billing
			billingCycle: doc.billingCycle,
			cycles: doc.cycles,
			totalAmount: doc.totalAmount,

			// Adjustments
			bonusDays: doc.bonusDays,
			manualAdjustmentDays: doc.manualAdjustmentDays,

			// Suspension
			suspendedAt: doc.suspendedAt,
			totalSuspendedDuration: doc.totalSuspendedDuration,
			suspensionReason: doc.suspensionReason,

			// Renewal
			autoRenew: doc.autoRenew,
			lastRenewedAt: doc.lastRenewedAt,
			nextRenewalDate: doc.nextRenewalDate,

			// Cancellation
			canceledAt: doc.canceledAt,
			cancellationReason: doc.cancellationReason,

			// Grace period
			gracePeriodDays: doc.gracePeriodDays,

			// Payments history
			payments: doc.payments,

			// Audit trail
			events: doc.events,

			// Network integration
			routerProfile: doc.routerProfile,

			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt
		};
	}
}