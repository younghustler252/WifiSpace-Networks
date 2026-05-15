import { Plan } from "../../domain/plan.entity.js";

export class PlanMapper {
	// -----------------------------
	// DATABASE -> ENTITY
	// -----------------------------
	static toEntity(planDoc) {
		if (!planDoc) return null;

		return new Plan({
			id: planDoc._id?.toString(),

			name: planDoc.name,

			serviceType: planDoc.serviceType,

			accountType: planDoc.accountType,

			price: planDoc.price,

			speedRate: planDoc.speedRate,

			durationValue: planDoc.durationValue,
			durationUnit: planDoc.durationUnit,

			dataLimitBytes: planDoc.dataLimitBytes,

			devicesAllowed: planDoc.devicesAllowed,

			features: planDoc.features,

			mikrotikProfile: planDoc.mikrotikProfile,

			status: planDoc.status,

			bonusRules: planDoc.bonusRules,

			createdAt: planDoc.createdAt,
			updatedAt: planDoc.updatedAt
		});
	}

	// -----------------------------
	// ENTITY -> DATABASE
	// -----------------------------
	static toPersistence(planEntity) {
		return {
			name: planEntity.name,

			serviceType: planEntity.serviceType,

			accountType: planEntity.accountType,

			price: planEntity.price,

			speedRate: planEntity.speedRate,

			durationValue: planEntity.durationValue,
			durationUnit: planEntity.durationUnit,

			dataLimitBytes: planEntity.dataLimitBytes,

			devicesAllowed: planEntity.devicesAllowed,

			features: planEntity.features,

			mikrotikProfile: planEntity.mikrotikProfile,

			status: planEntity.status,

			bonusRules: planEntity.bonusRules
		};
	}
}