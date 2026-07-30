import { Subscription } from "../../domain/subscription.entity.js";

export class SubscriptionMapper {

	// ---------------------------------
	// Mongo → Domain
	// ---------------------------------
	static toDomain(doc) {
		if (!doc) return null;

		return new Subscription({
			id: doc._id?.toString(),

			accountId: doc.accountId,
			userId: doc.userId,
			planId: doc.planId,
			status: doc.status,

			planSnapshot: doc.planSnapshot,

			cycles: doc.cycles,
			totalAmount: doc.totalAmount,

			startsAt: doc.startsAt,
			expiresAt: doc.expiresAt,
			graceEndsAt: doc.graceEndsAt,
			activatedAt: doc.activatedAt,
			expiredAt: doc.expiredAt,

			currentPeriodStart: doc.currentPeriodStart,
			currentPeriodEnd: doc.currentPeriodEnd,

			bonusDays: doc.bonusDays,
			manualAdjustmentDays: doc.manualAdjustmentDays,

			suspendedAt: doc.suspendedAt,
			totalSuspendedDuration: doc.totalSuspendedDuration,
			suspensionReason: doc.suspensionReason,

			renewalStrategy: doc.renewalStrategy,
			autoRenewEnabled: doc.autoRenewEnabled,
			nextRenewalDate: doc.nextRenewalDate,
			lastRenewedAt: doc.lastRenewedAt,

			canceledAt: doc.canceledAt,
			cancellationReason: doc.cancellationReason,

			lastPaymentId: doc.lastPaymentId,
			lastPaymentDate: doc.lastPaymentDate,
			lastPaymentAmount: doc.lastPaymentAmount,

			defaultPaymentChannel: doc.defaultPaymentChannel,
			billingAuthorization: doc.billingAuthorization,
			authorizationReusable: doc.authorizationReusable,

			mikrotikStatus: doc.mikrotikStatus,
			mikrotikLastSyncAt: doc.mikrotikLastSyncAt,
			mikrotikError: doc.mikrotikError,

			events: doc.events,
			remindersSent: doc.remindersSent || [],

			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt
		});
	}

	// ---------------------------------
	// Domain → Mongo
	// ---------------------------------
	static toPersistence(entity) {
		return {
			accountId: entity.accountId,
			userId: entity.userId,
			planId: entity.planId,
			status: entity.status,

			planSnapshot: entity.planSnapshot,

			cycles: entity.cycles,
			totalAmount: entity.totalAmount,

			startsAt: entity.startsAt,
			expiresAt: entity.expiresAt,
			graceEndsAt: entity.graceEndsAt,
			activatedAt: entity.activatedAt,
			expiredAt: entity.expiredAt,

			currentPeriodStart: entity.currentPeriodStart,
			currentPeriodEnd: entity.currentPeriodEnd,

			bonusDays: entity.bonusDays,
			manualAdjustmentDays: entity.manualAdjustmentDays,

			suspendedAt: entity.suspendedAt,
			totalSuspendedDuration: entity.totalSuspendedDuration,
			suspensionReason: entity.suspensionReason,

			renewalStrategy: entity.renewalStrategy,
			autoRenewEnabled: entity.autoRenewEnabled,
			nextRenewalDate: entity.nextRenewalDate,
			lastRenewedAt: entity.lastRenewedAt,

			canceledAt: entity.canceledAt,
			cancellationReason: entity.cancellationReason,

			lastPaymentId: entity.lastPaymentId,
			lastPaymentDate: entity.lastPaymentDate,
			lastPaymentAmount: entity.lastPaymentAmount,

			defaultPaymentChannel: entity.defaultPaymentChannel,
			billingAuthorization: entity.billingAuthorization,
			authorizationReusable: entity.authorizationReusable,

			mikrotikStatus: entity.mikrotikStatus,
			mikrotikLastSyncAt: entity.mikrotikLastSyncAt,
			mikrotikError: entity.mikrotikError,
			remindersSent: entity.remindersSent,
			events: entity.events

		};
	}

	// ---------------------------------
	// Mongo → DTO
	// ---------------------------------
	static toDTO(doc) {
		if (!doc) return null;

		return {
			id: doc._id?.toString(),
			accountId: doc.accountId,
			userId: doc.userId,
			planId: doc.planId,
			status: doc.status,

			planSnapshot: doc.planSnapshot,

			cycles: doc.cycles,
			totalAmount: doc.totalAmount,

			startsAt: doc.startsAt,
			expiresAt: doc.expiresAt,
			graceEndsAt: doc.graceEndsAt,
			activatedAt: doc.activatedAt,
			expiredAt: doc.expiredAt,

			currentPeriodStart: doc.currentPeriodStart,
			currentPeriodEnd: doc.currentPeriodEnd,

			bonusDays: doc.bonusDays,
			manualAdjustmentDays: doc.manualAdjustmentDays,

			suspendedAt: doc.suspendedAt,
			totalSuspendedDuration: doc.totalSuspendedDuration,
			suspensionReason: doc.suspensionReason,

			renewalStrategy: doc.renewalStrategy,
			autoRenewEnabled: doc.autoRenewEnabled,
			nextRenewalDate: doc.nextRenewalDate,
			lastRenewedAt: doc.lastRenewedAt,

			canceledAt: doc.canceledAt,
			cancellationReason: doc.cancellationReason,

			lastPaymentId: doc.lastPaymentId,
			lastPaymentDate: doc.lastPaymentDate,
			lastPaymentAmount: doc.lastPaymentAmount,

			defaultPaymentChannel: doc.defaultPaymentChannel,
			billingAuthorization: doc.billingAuthorization,
			authorizationReusable: doc.authorizationReusable,

			mikrotikStatus: doc.mikrotikStatus,
			mikrotikLastSyncAt: doc.mikrotikLastSyncAt,
			mikrotikError: doc.mikrotikError,

			events: doc.events,
			remindersSent: doc.remindersSent,

			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt
		};
	}
}