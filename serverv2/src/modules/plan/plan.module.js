import { PlanRepositoryMongo } from "./infrastructure/repositories/plan.repository.mongo.js";

import { CreatePlan } from "./usecases/admin/create-plan.js";
import { UpdatePlan } from "./usecases/admin/update-plan.js";
import { DeletePlan } from "./usecases/admin/delete-plan.js";

import { GetAllPlans } from "./usecases/shared/get-all-plans.js";
import { GetPlan } from "./usecases/shared/get-plan.js";

import { PlanController } from "./presentation/controllers/plan.controller.js";

import planRoutes from "./presentation/routes/plan.routes.js";

export function planModule({ permissionService }) {

	const repository = new PlanRepositoryMongo();

	const usecases = {
		createPlan: new CreatePlan(repository),
		updatePlan: new UpdatePlan(repository),
		deletePlan: new DeletePlan(repository),
		getAllPlans: new GetAllPlans(repository),
		getPlan: new GetPlan(repository)
	};

	const controller = new PlanController(usecases);

	const routes = planRoutes({
		planController: controller,
		permissionService
	});

	return {
		routes
	};
}