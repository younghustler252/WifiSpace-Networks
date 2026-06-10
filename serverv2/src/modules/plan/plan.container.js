import { asClass } from "awilix";

/*
|--------------------------------------------------------------------------
| REPOSITORY
|--------------------------------------------------------------------------
*/
import { PlanRepositoryMongo }
	from "./infrastructure/repositories/plan.repository.mongo.js";

/*
|--------------------------------------------------------------------------
| CONTROLLER
|--------------------------------------------------------------------------
*/
import { PlanController }
	from "./presentation/controllers/plan.controller.js";

/*
|--------------------------------------------------------------------------
| USECASES
|--------------------------------------------------------------------------
*/
import { CreatePlan } from "./usecases/admin/create-plan.js";
import { UpdatePlan } from "./usecases/admin/update-plan.js";
import { DeletePlan } from "./usecases/admin/delete-plan.js";

import { GetAllPlans } from "./usecases/shared/get-all-plans.js";
import { getPlanById } from "./usecases/shared/get-plan-By-Id.js";

/*
|--------------------------------------------------------------------------
| REGISTER MODULE
|--------------------------------------------------------------------------
*/
export function registerPlan(container) {

	container.register({

		/*
		|--------------------------------------------------------------------------
		| REPOSITORY
		|--------------------------------------------------------------------------
		*/
		planRepository: asClass(PlanRepositoryMongo).singleton(),

		/*
		|--------------------------------------------------------------------------
		| USECASES
		|--------------------------------------------------------------------------
		*/
		createPlan: asClass(CreatePlan).scoped(),
		updatePlan: asClass(UpdatePlan).scoped(),
		deletePlan: asClass(DeletePlan).scoped(),
		getAllPlans: asClass(GetAllPlans).scoped(),
		getPlanById: asClass(getPlanById).scoped(),

		/*
		|--------------------------------------------------------------------------
		| CONTROLLER (IMPORTANT)
		|--------------------------------------------------------------------------
		*/
		planController: asClass(PlanController).scoped()
	});
}