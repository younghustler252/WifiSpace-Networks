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

		// dataLimitBytes = 0,

		devicesAllowed = 1,

		features = [],

		mikrotikProfile,

		status = "active",

		bonusRules = [],

		createdAt,
		updatedAt
	}) {
		this.id = id;

		this.name = name?.trim();

		this.serviceType = serviceType;

		this.accountType = accountType;

		this.price = price;

		this.speedRate = speedRate?.trim();

		this.durationValue = durationValue;
		this.durationUnit = durationUnit;

		// this.dataLimitBytes = dataLimitBytes;

		this.devicesAllowed = devicesAllowed;

		this.features = features;

		this.mikrotikProfile = mikrotikProfile?.trim();

		this.status = status;

		this.bonusRules = bonusRules;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;

		this.validate();
	}

	validate() {
		if (!this.name) {
			throw new Error("Plan name is required");
		}

		if (!["pppoe", "hotspot"].includes(this.serviceType)) {
			throw new Error("Invalid service type");
		}

		if (
			this.serviceType === "pppoe" &&
			!["personal", "business"].includes(this.accountType)
		) {
			throw new Error(
				"PPPoE plans require a valid account type"
			);
		}

		if (this.price < 0) {
			throw new Error("Price cannot be negative");
		}
	}

	isHotspotPlan() {
		return this.serviceType === "hotspot";
	}

	isPPPoEPlan() {
		return this.serviceType === "pppoe";
	}

	// isUnlimitedPlan() {
	// 	return this.dataLimitBytes === 0;
	// }

	activate() {
		this.status = "active";
	}

	deactivate() {
		this.status = "inactive";
	}
}