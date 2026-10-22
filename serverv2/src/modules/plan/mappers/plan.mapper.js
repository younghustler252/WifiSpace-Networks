import { Plan } from "../domain/plan.entity.js";

export class PlanMapper {
	static toDomain(raw) {
		if (!raw) return null;

		return new Plan({
			id: raw._id?.toString() || raw.id,
			name: raw.name,
			serviceType: raw.serviceType,
			accountType: raw.accountType,
			price: raw.price,
			speedRate: raw.speedRate,
			durationValue: raw.durationValue,
			durationUnit: raw.durationUnit,
			dataLimitBytes: raw.dataLimitBytes,
			devicesAllowed: raw.devicesAllowed,
			features: raw.features,
			mikrotikProfile: raw.mikrotikProfile,
			ipoeProfile: raw.ipoeProfile,
			gracePeriodDays: raw.gracePeriodDays,
			discountType: raw.discountType,
			discountValue: raw.discountValue,
			discountValidUntil: raw.discountValidUntil,
			status: raw.status,
			bonusRules: raw.bonusRules,
			deletedAt: raw.deletedAt,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt
		});
	}

	static toPersistence(plan) {
		const data = {
			name: plan.name,
			serviceType: plan.serviceType,
			accountType: plan.accountType,
			price: plan.price,
			speedRate: plan.speedRate,
			durationValue: plan.durationValue,
			durationUnit: plan.durationUnit,
			dataLimitBytes: plan.dataLimitBytes,
			devicesAllowed: plan.devicesAllowed,
			features: plan.features,
			mikrotikProfile: plan.mikrotikProfile,
			ipoeProfile: plan.ipoeProfile,
			gracePeriodDays: plan.gracePeriodDays,
			discountType: plan.discountType,
			discountValue: plan.discountValue,
			discountValidUntil: plan.discountValidUntil,
			status: plan.status,
			bonusRules: plan.bonusRules,
			deletedAt: plan.deletedAt
		};

		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}