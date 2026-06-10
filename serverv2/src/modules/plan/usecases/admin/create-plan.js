import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { Plan } from "../../domain/plan.entity.js";

export class CreatePlan {
	constructor({ planRepository }) {
		this.planRepository = planRepository;
	}

	async execute(data) {
		let {
			name,
			serviceType,
			accountType = null,

			price,
			speedRate,

			durationValue,
			durationUnit = "days",

			devicesAllowed = 1,

			features = [],

			mikrotikProfile,

			bonusRules = []
		} = data;

		// -----------------------------
		// REQUIRED FIELDS
		// -----------------------------
		if (
			!name ||
			!serviceType ||
			price == null ||
			!speedRate ||
			!durationValue ||
			!mikrotikProfile
		) {
			throw new ValidationError("Missing required plan fields");
		}

		// -----------------------------
		// NORMALIZATION
		// -----------------------------
		name = name.trim();
		serviceType = serviceType.toLowerCase().trim();
		speedRate = speedRate.trim();
		mikrotikProfile = mikrotikProfile.trim();

		if (accountType) {
			accountType = accountType.toLowerCase().trim();
		}

		// -----------------------------
		// SERVICE TYPE VALIDATION
		// -----------------------------
		if (!["pppoe", "hotspot"].includes(serviceType)) {
			throw new ValidationError("Invalid service type");
		}

		if (serviceType === "pppoe") {
			if (!["personal", "business"].includes(accountType)) {
				throw new ValidationError(
					"PPPoE plans require account type (personal or business)"
				);
			}
		} else {
			accountType = null;
		}

		// -----------------------------
		// BASIC VALIDATIONS
		// -----------------------------
		if (isNaN(price) || price < 0) {
			throw new ValidationError("Invalid price value");
		}

		if (isNaN(durationValue) || durationValue <= 0) {
			throw new ValidationError("Invalid duration value");
		}

		if (!["minutes", "hours", "days", "months"].includes(durationUnit)) {
			throw new ValidationError("Invalid duration unit");
		}

		if (isNaN(devicesAllowed) || devicesAllowed < 1) {
			throw new ValidationError("Devices allowed must be at least 1");
		}

		if (!Array.isArray(features)) {
			throw new ValidationError("Features must be an array");
		}

		if (!Array.isArray(bonusRules)) {
			throw new ValidationError("Bonus rules must be an array");
		}

		// -----------------------------
		// DUPLICATE CHECK
		// -----------------------------
		const existingPlan = await this.planRepository.findByName(name);

		if (existingPlan) {
			throw new ValidationError("Plan with this name already exists");
		}

		// -----------------------------
		// CREATE ENTITY
		// -----------------------------
		const plan = new Plan({
			name,
			serviceType,
			accountType,

			price,
			speedRate,

			durationValue,
			durationUnit,

			devicesAllowed,

			features,

			mikrotikProfile,

			bonusRules
		});

		// -----------------------------
		// SAVE
		// -----------------------------
		return await this.planRepository.create(plan);
	}
}