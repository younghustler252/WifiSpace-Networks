import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetAllPlans {
	constructor(planRepository) {
		this.planRepository = planRepository;
	}

	async execute(filters = {}) {
		let {
			serviceType,
			accountType,
			sort,
			page = 1,
			limit = 10,
		} = filters;

		// -----------------------------
		// NORMALIZATION (IMPORTANT FIX)
		// -----------------------------

		const allowedSorts = ["price_asc", "price_desc"];

		// handle empty string or undefined
		const finalSort =
			!sort || sort.trim() === ""
				? "price_desc"
				: sort;

		// -----------------------------
		// VALIDATION
		// -----------------------------

		if (
			serviceType &&
			!["pppoe", "hotspot"].includes(serviceType)
		) {
			throw new ValidationError(
				"Service type must be pppoe or hotspot"
			);
		}

		if (
			accountType &&
			!["personal", "business"].includes(accountType)
		) {
			throw new ValidationError(
				"Account type must be personal or business"
			);
		}

		if (!allowedSorts.includes(finalSort)) {
			throw new ValidationError(
				"Sort must be price_asc or price_desc"
			);
		}

		// -----------------------------
		// SANITIZE NUMBERS
		// -----------------------------

		const pageNum = Math.max(parseInt(page) || 1, 1);
		const limitNum = Math.max(parseInt(limit) || 10, 1);

		// -----------------------------
		// CALL REPOSITORY
		// -----------------------------

		return this.planRepository.findAll({
			serviceType,
			accountType,
			sort: finalSort,
			status: "active",
			page: pageNum,
			limit: limitNum,
		});
	}
}