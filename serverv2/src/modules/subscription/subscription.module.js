import { SubscriptionRepositoryMongo } from "./infrastructure/repositories/subscription.respository.mongo.js";
import { UserRepositoryMongo } from "../user/infrastructure/repositories/user.repository.mongo.js";

// ------------------------------------------------
// ACCOUNT USECASES
// ------------------------------------------------
import { CreateSubscriptionUseCase } from "./usecases/account/create-subscription.js";
import { RenewSubscriptionUseCase } from "./usecases/account/renew-subscription.js";
import { UpgradeSubscriptionUseCase } from "./usecases/account/upgrade-subscription.js";

// ------------------------------------------------
// ADMIN USECASES
// ------------------------------------------------
import { AdminCreateSubscriptionUseCase } from "./usecases/admin/create-subscription.js";

import { SuspendSubscriptionUseCase } from "./usecases/admin/suspend-subscription.js";
import { ResumeSubscriptionUseCase } from "./usecases/admin/resume-subscription.js";
import { CancelSubscriptionUseCase } from "./usecases/admin/cancel-subscription.js";

import { ExtendSubscriptionUseCase } from "./usecases/admin/extend-subscription.js";

import { ForceExpireSubscriptionUseCase } from "./usecases/admin/force-expire-subscription.js";

// ------------------------------------------------
// SHARED USECASES
// ------------------------------------------------
import { GetSubscriptionUseCase } from "./usecases/shared/get-subscription.js";

import { GetCurrentSubscriptionUseCase } from "./usecases/shared/get-current-subscription.js";

import { GetAccountSubscriptionsUseCase } from "./usecases/shared/get-account-subscriptions.js";

import { GetUserSubscriptionsUseCase } from "./usecases/shared/get-user-subscriptions.js";

import { GetAllSubscriptionsUseCase } from "./usecases/shared/get-all-subscriptions.js";

// ------------------------------------------------
// SYSTEM USECASES
// ------------------------------------------------
import { ExpireSubscriptionUseCase } from "./usecases/system/expire-subscriptions.js";

// ------------------------------------------------
// CONTROLLERS
// ------------------------------------------------
import { SubscriptionController } from "./presentation/controllers/subscription.controller.js";

import { SubscriptionAdminController } from "./presentation/controllers/admin.controller.js";

// ------------------------------------------------
// ROUTES
// ------------------------------------------------
import subscriptionRoutes from "./presentation/routes/subscription.routes.js";

export function subscriptionModule({
	planRepository,
	accountRepository,
	permissionService
}) {

	// ------------------------------------------------
	// REPOSITORIES
	// ------------------------------------------------
	const subscriptionRepository =
		new SubscriptionRepositoryMongo();

	const userRepository =
		new UserRepositoryMongo();

	// ------------------------------------------------
	// USECASES
	// ------------------------------------------------
	const usecases = {

		// ============================================
		// ACCOUNT
		// ============================================

		createSubscription:
			new CreateSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository,

				planRepository
			}),

		renewSubscription:
			new RenewSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository
			}),

		upgradeSubscription:
			new UpgradeSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository,

				planRepository
			}),

		// ============================================
		// ADMIN
		// ============================================

		adminCreateSubscription:
			new AdminCreateSubscriptionUseCase({

				subscriptionRepository,

				planRepository
			}),

		suspendSubscription:
			new SuspendSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository
			}),

		resumeSubscription:
			new ResumeSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository
			}),

		cancelSubscription:
			new CancelSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository
			}),

		extendSubscription:
			new ExtendSubscriptionUseCase({

				subscriptionRepository
			}),

		forceExpireSubscription:
			new ForceExpireSubscriptionUseCase({

				subscriptionRepository
			}),

		// ============================================
		// SHARED
		// ============================================

		getSubscription:
			new GetSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository
			}),

		getCurrentSubscription:
			new GetCurrentSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository
			}),

		getAccountSubscriptions:
			new GetAccountSubscriptionsUseCase({

				accountSubscriptionRepository:
					subscriptionRepository
			}),

		getUserSubscriptions:
			new GetUserSubscriptionsUseCase({

				accountSubscriptionRepository:
					subscriptionRepository,

				accountRepository
			}),

		getAllSubscriptions:
			new GetAllSubscriptionsUseCase({

				accountSubscriptionRepository:
					subscriptionRepository
			}),

		// ============================================
		// SYSTEM
		// ============================================

		expireSubscriptions:
			new ExpireSubscriptionUseCase({

				accountSubscriptionRepository:
					subscriptionRepository,

				accountRepository
			})
	};

	// ------------------------------------------------
	// CONTROLLERS
	// ------------------------------------------------
	const subscriptionController =
		new SubscriptionController(usecases);

	const subscriptionAdminController =
		new SubscriptionAdminController(usecases);

	// ------------------------------------------------
	// ROUTES
	// ------------------------------------------------
	const routes = subscriptionRoutes({

		subscriptionController,

		subscriptionAdminController,

		permissionService,

		userRepository
	});

	return { routes };
}