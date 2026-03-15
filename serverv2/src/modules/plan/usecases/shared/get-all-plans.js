import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetAllPlans {

	constructor(planRepository) {
		this.planRepository = planRepository;
	}

	async execute(filters = {}) {

		const { type, sort } = filters;

		// Validate type
		if (type && !["personal", "business"].includes(type)) {
			throw new ValidationError(
				"Type must be either 'personal' or 'business'"
			);
		}

		const allowedSorts = ["price_asc", "price_desc"];

		if (sort && !allowedSorts.includes(sort)) {
			throw new ValidationError(
				"Sort must be price_asc or price_desc"
			);
		}

		return this.planRepository.findAll({
			type,
			sort,
			status: "active"
		});
	}
}