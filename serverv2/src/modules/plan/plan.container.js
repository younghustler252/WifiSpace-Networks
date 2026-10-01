// plan.container.js
import { asClass } from "awilix";

import { PlanRepositoryMongo } from "./repositories/plan.repository.mongo.js";

import { CreatePlan } from "./usecases/admin/create-plan.usecase.js";
import { UpdatePlan } from "./usecases/admin/update-plan.usecase.js";
import { DeletePlan } from "./usecases/admin/delete-plan.usecase.js";
import { ActivatePlan } from "./usecases/admin/activate-plan.usecase.js";
import { DeactivatePlan } from "./usecases/admin/deactivate-plan.usecase.js";
import { GetPlans } from "./usecases/shared/get-plans.usecase.js";
import { GetPlanById } from "./usecases/shared/get-plan-by-id.usecase.js";

import { PlanController } from "./controllers/plan.controller.js";
import { AdminController } from "./controllers/admin.controller.js";

export function registerPlan(container) {
	container.register({
		planRepository: asClass(PlanRepositoryMongo).singleton(),

		createPlan: asClass(CreatePlan).scoped(),
		updatePlan: asClass(UpdatePlan).scoped(),
		deletePlan: asClass(DeletePlan).scoped(),
		activatePlan: asClass(ActivatePlan).scoped(),
		deactivatePlan: asClass(DeactivatePlan).scoped(),
		getPlans: asClass(GetPlans).scoped(),
		getPlanById: asClass(GetPlanById).scoped(),

		planController: asClass(PlanController).scoped(),
		adminController: asClass(AdminController).scoped()
	});
}