// ======================================================
// subscription.container.js
// FULL AWILIX VERSION
// ======================================================

import { asClass } from "awilix";

/*
|--------------------------------------------------------------------------
| REPOSITORY
|--------------------------------------------------------------------------
*/
import { SubscriptionRepositoryMongo } from "./infrastructure/repositories/subscription.respository.mongo.js";

/*
|--------------------------------------------------------------------------
| CONTROLLERS
|--------------------------------------------------------------------------
*/
import { SubscriptionController }
	from "./presentation/controllers/subscription.controller.js";

import { SubscriptionAdminController }
	from "./presentation/controllers/admin.controller.js";

/*
|--------------------------------------------------------------------------
| USE CASES - ACCOUNT
|--------------------------------------------------------------------------
*/
import { CreateSubscriptionUseCase }
	from "./usecases/account/create-subscription.js";

import { RenewSubscriptionUseCase }
	from "./usecases/account/renew-subscription.js";

import { UpgradeSubscriptionUseCase }
	from "./usecases/account/upgrade-subscription.js";

/*
|--------------------------------------------------------------------------
| USE CASES - ADMIN
|--------------------------------------------------------------------------
*/
import { AdminCreateSubscriptionUseCase }
	from "./usecases/admin/create-subscription.js";

import { AdminRenewSubscriptionUseCase }
	from "./usecases/admin/renew-subscription.js";

import { ExtendSubscriptionUseCase }
	from "./usecases/admin/extend-subscription.js";

import { CancelSubscriptionUseCase }
	from "./usecases/admin/cancel-subscription.js";

import { ResumeSubscriptionUseCase }
	from "./usecases/admin/resume-subscription.js";

import { SuspendSubscriptionUseCase } 
	from "./usecases/admin/suspend-subscription.js";

import { ForceExpireSubscriptionUseCase } from "./usecases/admin/force-expire-subscription.js";

import { GetSubscriptionUseCase } from "./usecases/shared/get-subscription.js";
import { GetCurrentSubscriptionUseCase } from "./usecases/shared/get-current-subscription.js";
import { GetAllSubscriptionsUseCase } from "./usecases/shared/get-all-subscriptions.js";
import { GetAccountSubscriptionsUseCase } from "./usecases/shared/get-account-subscriptions.js";
/*
|--------------------------------------------------------------------------
| SYSTEM USE CASES
|--------------------------------------------------------------------------
*/
import { ExpireSubscriptionsUseCase } from "./usecases/system/expire-subscriptions.js";

/*
|--------------------------------------------------------------------------
| REGISTER MODULE
|--------------------------------------------------------------------------
*/
export function registerSubscription(container) {

	container.register({

		/*
		|--------------------------------------------------------------------------
		| REPOSITORY
		|--------------------------------------------------------------------------
		*/
		subscriptionRepository:
			asClass(SubscriptionRepositoryMongo).singleton(),

		/*
		|--------------------------------------------------------------------------
		| ACCOUNT USE CASES
		|--------------------------------------------------------------------------
		*/
		createSubscription:
			asClass(CreateSubscriptionUseCase).scoped(),

		renewSubscription:
			asClass(RenewSubscriptionUseCase).scoped(),

		upgradeSubscription:
			asClass(UpgradeSubscriptionUseCase).scoped(),

		/*
		|--------------------------------------------------------------------------
		| ADMIN USE CASES
		|--------------------------------------------------------------------------
		*/
		adminCreateSubscription:
			asClass(AdminCreateSubscriptionUseCase).scoped(),

		adminRenewSubscription:
			asClass(AdminRenewSubscriptionUseCase).scoped(),

		extendSubscription:
			asClass(ExtendSubscriptionUseCase).scoped(),

		cancelSubscription:
			asClass(CancelSubscriptionUseCase).scoped(),

		resumeSubscription:
			asClass(ResumeSubscriptionUseCase).scoped(),

		suspendSubscription:
			asClass(SuspendSubscriptionUseCase).scoped(),

		forceExpireSubscription:
			asClass(ForceExpireSubscriptionUseCase).scoped(),
		/*
		|--------------------------------------------------------------------------
		| SHARED QUERY USE CASES
		|--------------------------------------------------------------------------
		*/
		getSubscription:
			asClass(GetSubscriptionUseCase).scoped(),

		getCurrentSubscription:
			asClass(GetCurrentSubscriptionUseCase).scoped(),

		getAllSubscriptions:
			asClass(GetAllSubscriptionsUseCase).scoped(),

		getAccountSubscriptions:
			asClass(GetAccountSubscriptionsUseCase).scoped(),
			
		/*
		|--------------------------------------------------------------------------
		| SYSTEM USE CASES
		|--------------------------------------------------------------------------
		*/
		expireSubscriptions:
			asClass(ExpireSubscriptionsUseCase).scoped(),

		/*
		|--------------------------------------------------------------------------
		| CONTROLLERS (IMPORTANT FOR FULL AWILIX FLOW)
		|--------------------------------------------------------------------------
		*/
		subscriptionController:
			asClass(SubscriptionController).scoped(),

		subscriptionAdminController:
			asClass(SubscriptionAdminController).scoped()
	});
}