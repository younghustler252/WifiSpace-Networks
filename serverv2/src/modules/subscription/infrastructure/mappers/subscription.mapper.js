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
			startDate: doc.startDate,
			endDate: doc.endDate,
			status: doc.status,
			autoRenew: doc.autoRenew,
			routerProfile: doc.routerProfile,
			paymentId: doc.paymentId,
			suspensionReason: doc.suspensionReason
		});
	}

	// -----------------------------
	// Domain → Mongo
	// -----------------------------
	static toPersistence(entity) {

		return {
			accountId: entity.accountId,
			planId: entity.planId,
			startDate: entity.startDate,
			endDate: entity.endDate,
			status: entity.status,
			autoRenew: entity.autoRenew,
			routerProfile: entity.routerProfile,
			paymentId: entity.paymentId,
			suspensionReason: entity.suspensionReason
		};
	}

	// -----------------------------
	// Mongo → Response DTO
	// -----------------------------
	static toDTO(doc) {

		if (!doc) return null;

		return {
			id: doc._id,
			accountId: doc.accountId,
			plan: doc.planId,
			startDate: doc.startDate,
			endDate: doc.endDate,
			status: doc.status,
			autoRenew: doc.autoRenew,
			routerProfile: doc.routerProfile,
			paymentId: doc.paymentId,
			suspensionReason: doc.suspensionReason,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt
		};
	}

}