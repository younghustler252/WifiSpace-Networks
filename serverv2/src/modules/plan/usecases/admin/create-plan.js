import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreatePlan {

	constructor(planRepository) {
		this.planRepository = planRepository;
	}

	async execute(data) {

		const {
			name,
			type,
			price,
			speedRate,
			durationDays = 30,
			devicesAllowed = 1,
			features = [],
			mikrotikProfile
		} = data;

		if (!name || !type || price === undefined || !speedRate || !mikrotikProfile) {
			throw new ValidationError("Missing required plan fields");
		}

		if (!["personal", "business"].includes(type)) {
			throw new ValidationError(
				"Plan type must be either 'personal' or 'business'"
			);
		}

		const existingPlan = await this.planRepository.findByName(name.trim());

		if (existingPlan) {
			throw new ValidationError("Plan with this name already exists");
		}

		const plan = new Plan({
			name: name.trim(),
			type,
			price,
			speedRate: speedRate.trim(),
			durationDays,
			devicesAllowed,
			features,
			mikrotikProfile: mikrotikProfile.trim()
		});

		return await this.planRepository.create(plan);
	}
}