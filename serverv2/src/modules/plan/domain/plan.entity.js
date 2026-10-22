import {
	SERVICE_TYPES, SERVICE_TYPE_LIST,
	PLAN_ACCOUNT_TYPES, PLAN_ACCOUNT_TYPE_LIST,
	DURATION_UNIT_LIST, DURATION_UNIT_SECONDS,
	PLAN_STATUSES, PLAN_STATUS_LIST,
	DISCOUNT_TYPES, DISCOUNT_TYPE_LIST
} from "./plan.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class Plan {
	constructor({
		id,
		name,
		serviceType,
		accountType = null,

		price,
		speedRate,

		durationValue,
		durationUnit,

		dataLimitBytes = 0, // 0 = unlimited

		devicesAllowed = 1,
		features = [],
		mikrotikProfile,
		ipoeProfile = null,
		gracePeriodDays = 0,

		discountType = null,
		discountValue = 0,
		discountValidUntil = null,

		status = PLAN_STATUSES.ACTIVE,
		bonusRules = [],

		deletedAt = null,
		createdAt = null,
		updatedAt = null
	}) {
		this.id = id;
		this.name = name?.trim();
		this.serviceType = serviceType;
		this.accountType = serviceType === SERVICE_TYPES.PPPOE ? accountType : null;

		this.price = price;
		this.speedRate = speedRate?.trim();

		this.durationValue = durationValue;
		this.durationUnit = durationUnit;

		this.dataLimitBytes = dataLimitBytes;

		this.devicesAllowed = devicesAllowed;
		this.features = features;
		this.mikrotikProfile = mikrotikProfile?.trim();
		this.ipoeProfile = serviceType === SERVICE_TYPES.PPPOE ? ipoeProfile?.trim() || null : null;
		this.gracePeriodDays = gracePeriodDays;

		this.discountType = discountType;
		this.discountValue = discountValue;
		this.discountValidUntil = discountValidUntil;

		this.status = status;
		this.bonusRules = bonusRules;

		this.deletedAt = deletedAt;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;

		this.validate();
	}

	validate() {
		if (!this.name) throw new ValidationError("Plan name is required");
		if (!SERVICE_TYPE_LIST.includes(this.serviceType)) throw new ValidationError("Invalid service type");

		if (this.serviceType === SERVICE_TYPES.PPPOE && !PLAN_ACCOUNT_TYPE_LIST.includes(this.accountType)) {
			throw new ValidationError("PPPoE plans require a valid account type (personal or business)");
		}

		if (this.price == null || this.price < 0) throw new ValidationError("Price cannot be negative");
		if (!this.durationValue || this.durationValue <= 0) throw new ValidationError("Invalid duration value");
		if (!DURATION_UNIT_LIST.includes(this.durationUnit)) throw new ValidationError("Invalid duration unit");
		if (this.dataLimitBytes < 0) throw new ValidationError("Data limit cannot be negative");
		if (this.devicesAllowed < 1) throw new ValidationError("Devices allowed must be at least 1");
		if (!this.mikrotikProfile) throw new ValidationError("MikroTik profile is required");

		if (this.discountType && !DISCOUNT_TYPE_LIST.includes(this.discountType)) {
			throw new ValidationError("Invalid discount type");
		}
		if (this.discountType && (this.discountValue == null || this.discountValue <= 0)) {
			throw new ValidationError("Discount value must be greater than zero when a discount type is set");
		}
		if (this.discountType === DISCOUNT_TYPES.PERCENTAGE && this.discountValue > 100) {
			throw new ValidationError("Percentage discount cannot exceed 100");
		}
	}

	isHotspotPlan() { return this.serviceType === SERVICE_TYPES.HOTSPOT; }
	isPPPoEPlan() { return this.serviceType === SERVICE_TYPES.PPPOE; }
	isUnlimitedData() { return this.dataLimitBytes === 0; }
	isActive() { return this.status === PLAN_STATUSES.ACTIVE; }
	isDeleted() { return this.deletedAt !== null; }

	// Approximate duration in seconds — used for hotspot entitlement math.
	// A PPPoE monthly renewal should still be computed via calendar-month
	// arithmetic in Subscription (see below), not this constant.
	getDurationSeconds() {
		return this.durationValue * DURATION_UNIT_SECONDS[this.durationUnit];
	}

	isDiscountActive() {
		if (!this.discountType) return false;
		if (!this.discountValidUntil) return true;
		return new Date(this.discountValidUntil) > new Date();
	}

	getEffectivePrice() {
		if (!this.isDiscountActive()) return this.price;

		if (this.discountType === DISCOUNT_TYPES.PERCENTAGE) {
			return Math.max(0, this.price - (this.price * this.discountValue) / 100);
		}

		return Math.max(0, this.price - this.discountValue);
	}

	getBonusDaysForCycle(consecutiveCycles) {
		const applicable = this.bonusRules
			.filter((rule) => consecutiveCycles >= rule.minCycles)
			.sort((a, b) => b.minCycles - a.minCycles)[0];

		return applicable?.bonusDays ?? 0;
	}

	activate() { this.status = PLAN_STATUSES.ACTIVE; }
	deactivate() { this.status = PLAN_STATUSES.INACTIVE; }

	toSnapshot() {
		return {
			name: this.name, serviceType: this.serviceType, price: this.getEffectivePrice(),
			durationValue: this.durationValue, durationUnit: this.durationUnit,
			speedRate: this.speedRate, mikrotikProfile: this.mikrotikProfile, ipoeProfile: this.ipoeProfile,
			devicesAllowed: this.devicesAllowed, gracePeriodDays: this.gracePeriodDays
		};
	}


	toJSON() {
		return { ...this };
	}

}