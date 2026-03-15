import { SubscriptionRepositoryMongo } from "./infrastructure/repositories/subscription.respository.mongo.js";

// Usecases
import { CreateSubscriptionUseCase } from "./usecases/account/create-subscription.js";
import { RenewSubscriptionUseCase } from "./usecases/account/renew-subscription.js";
import { UpgradeSubscriptionUseCase } from "./usecases/account/upgrade-subscription.js";

import { SuspendSubscriptionUseCase } from "./usecases/admin/suspend-subscription.js";
import { ResumeSubscriptionUseCase } from "./usecases/admin/resume-subscription.js";
import { CancelSubscriptionUseCase } from "./usecases/admin/cancel-subscription.js";

import { GetSubscriptionUseCase } from "./usecases/shared/get-subscription.js";
import { GetActiveSubscriptionUseCase } from "./usecases/shared/get-active-subscription.js";
import { GetAccountSubscriptionsUseCase } from "./usecases/shared/get-account-subscriptions.js";
import { GetUserSubscriptionsUseCase } from "./usecases/shared/get-user-subscriptions.js";
import { GetAllSubscriptionsUseCase } from "./usecases/shared/get-all-subscriptions.js";

import { ExpireSubscriptionsUseCase } from "./usecases/system/expire-subscriptions.js";

import { SubscriptionController } from "./presentation/controllers/subscription.controller.js";
import { SubscriptionAdminController } from "./presentation/controllers/admin.controller.js";

import subscriptionRoutes from "./presentation/routes/subscription.routes.js";

export function subscriptionModule({ planRepository, accountRepository, permissionService }) {

	const subscriptionRepository = new SubscriptionRepositoryMongo();

	// ----------------------------
	// Usecases
	// ----------------------------
	const usecases = {
		// Account
		createSubscription: new CreateSubscriptionUseCase({ accountSubscriptionRepository: subscriptionRepository, planRepository }),
		renewSubscription: new RenewSubscriptionUseCase({ accountSubscriptionRepository: subscriptionRepository }),
		upgradeSubscription: new UpgradeSubscriptionUseCase({ accountSubscriptionRepository: subscriptionRepository, planRepository }),

		// Admin
		suspendSubscription: new SuspendSubscriptionUseCase({ accountSubscriptionRepository: subscriptionRepository }),
		resumeSubscription: new ResumeSubscriptionUseCase({ accountSubscriptionRepository: subscriptionRepository }),
		cancelSubscription: new CancelSubscriptionUseCase({ accountSubscriptionRepository: subscriptionRepository }),

		// Shared
		getSubscription: new GetSubscriptionUseCase({ accountSubscriptionRepository: subscriptionRepository }),
		getActiveSubscription: new GetActiveSubscriptionUseCase({ accountSubscriptionRepository: subscriptionRepository }),
		getAccountSubscriptions: new GetAccountSubscriptionsUseCase({ accountSubscriptionRepository: subscriptionRepository }),
		getUserSubscriptions: new GetUserSubscriptionsUseCase({ accountSubscriptionRepository: subscriptionRepository, accountRepository }),
		getAllSubscriptions: new GetAllSubscriptionsUseCase({ accountSubscriptionRepository: subscriptionRepository }),

		// System
		expireSubscriptions: new ExpireSubscriptionsUseCase({ accountSubscriptionRepository: subscriptionRepository, accountRepository })
	};

	// ----------------------------
	// Controllers
	// ----------------------------
	const subscriptionController = new SubscriptionController(usecases);
	const subscriptionAdminController = new SubscriptionAdminController(usecases);

	// ----------------------------
	// Routes
	// ----------------------------
	const routes = subscriptionRoutes({
		subscriptionController,
		subscriptionAdminController,
		permissionService
	});

	return { routes };
}