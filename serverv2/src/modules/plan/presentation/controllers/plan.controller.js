import expressAsyncHandler from "express-async-handler";
import { successResponse } from "../../../../shared/utils/api-response.js";

export class PlanController {
	constructor({
		createPlan,
		updatePlan,
		deletePlan,
		getAllPlans,
		getPlanById
	}) {
		this.createPlan = createPlan;
		this.updatePlan = updatePlan;
		this.deletePlan = deletePlan;
		this.getAllPlans = getAllPlans;
		this.getPlanById = getPlanById;
	}

	create = expressAsyncHandler(async (req, res) => {
		const plan = await this.createPlan.execute(req.body);

		return successResponse({
			res,
			data: plan,
			message: "Plan created",
			code: "PLAN_CREATED",
			statusCode: 201
		});
	});

	update = expressAsyncHandler(async (req, res) => {
		const plan = await this.updatePlan.execute(
			req.params.id,
			req.body
		);

		return successResponse({
			res,
			data: plan,
			message: "Plan updated",
			code: "PLAN_UPDATED"
		});
	});

	remove = expressAsyncHandler(async (req, res) => {
		await this.deletePlan.execute(req.params.id);

		return successResponse({
			res,
			message: "Plan deleted",
			code: "PLAN_DELETED"
		});
	});

	getAll = expressAsyncHandler(async (req, res) => {
		const result = await this.getAllPlans.execute({
			serviceType: req.query.serviceType,
			accountType: req.query.accountType,
			sort: req.query.sort,
			page: req.query.page,
			limit: req.query.limit
		});

		return successResponse({
			res,
			data: result,
			message: "Plans fetched",
			code: "PLANS_FETCHED"
		});
	});

	getById = expressAsyncHandler(async (req, res) => {
		const plan = await this.getPlanById.execute(req.params.id);

		return successResponse({
			res,
			data: plan,
			message: "Plan fetched",
			code: "PLAN_FETCHED"
		});
	});
}