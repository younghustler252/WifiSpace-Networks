// controllers/plan.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class PlanController {
	constructor({ getPlans, getPlanById }) {
		this.getPlansUseCase = getPlans;
		this.getPlanByIdUseCase = getPlanById;
	}

	getPlans = async (req, res) => {
		const { data, meta } = await this.getPlansUseCase.execute({ scope: "public", ...req.query });
		return paginatedResponse({ res, data: data.map((p) => p.toJSON()), meta, message: "Plans fetched successfully" });
	};

	getPlanById = async (req, res) => {
	console.log("GET PLAN BY ID:", req.params.id);

	const plan = await this.getPlanByIdUseCase.execute({ planId: req.params.id });

	return successResponse({
		res,
		data: plan.toJSON(),
		message: "Plan fetched successfully"
	});
};

}