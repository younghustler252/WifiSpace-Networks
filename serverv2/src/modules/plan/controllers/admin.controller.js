// controllers/admin.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({ createPlan, updatePlan, deletePlan, activatePlan, deactivatePlan, getPlans, getPlanById }) {
		this.createPlanUseCase = createPlan;
		this.updatePlanUseCase = updatePlan;
		this.deletePlanUseCase = deletePlan;
		this.activatePlanUseCase = activatePlan;
		this.deactivatePlanUseCase = deactivatePlan;
		this.getPlansUseCase = getPlans;
		this.getPlanByIdUseCase = getPlanById;
	}

	getPlans = async (req, res) => {
		const { data, meta } = await this.getPlansUseCase.execute({ scope: "admin", ...req.query });
		return paginatedResponse({ res, data: data.map((p) => p.toJSON()), meta, message: "Plans fetched successfully" });
	};

	getPlanById = async (req, res) => {
		const plan = await this.getPlanByIdUseCase.execute({ planId: req.params.id });
		return successResponse({ res, data: plan.toJSON(), message: "Plan fetched successfully" });
	};

	createPlan = async (req, res) => {
		const plan = await this.createPlanUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: plan.toJSON(), message: "Plan created successfully", statusCode: 201 });
	};

	updatePlan = async (req, res) => {
		const plan = await this.updatePlanUseCase.execute({ actorId: req.user.id, planId: req.params.id, data: req.body, ip: req.ip });
		return successResponse({ res, data: plan.toJSON(), message: "Plan updated successfully" });
	};

	deletePlan = async (req, res) => {
		const result = await this.deletePlanUseCase.execute({ actorId: req.user.id, planId: req.params.id, ip: req.ip });
		return successResponse({ res, message: result.message });
	};

	activatePlan = async (req, res) => {
		const plan = await this.activatePlanUseCase.execute({ actorId: req.user.id, planId: req.params.id, ip: req.ip });
		return successResponse({ res, data: plan.toJSON(), message: "Plan activated successfully" });
	};

	deactivatePlan = async (req, res) => {
		const plan = await this.deactivatePlanUseCase.execute({ actorId: req.user.id, planId: req.params.id, ip: req.ip });
		return successResponse({ res, data: plan.toJSON(), message: "Plan deactivated successfully" });
	};
}