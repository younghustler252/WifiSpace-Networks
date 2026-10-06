import { asClass } from "awilix";
import { SubscriptionRepositoryMongo } from "./repositories/subscription.repository.mongo.js";

import { Subscribe } from "./usecases/user/subscribe.usecase.js";
import { GetMySubscriptions } from "./usecases/user/get-my-subscriptions.usecase.js";

import { AdminCreateSubscription } from "./usecases/admin/create-subscription.usecase.js";
import { GetAllSubscriptions } from "./usecases/admin/get-all-subscriptions.usecase.js";
import { GetSubscriptionById } from "./usecases/admin/get-subscription-by-id.usecase.js";
import { AdminSuspendSubscription } from "./usecases/admin/suspend-subscription.usecase.js";
import { AdminResumeSubscription } from "./usecases/admin/resume-subscription.usecase.js";
import { GetUpgradeOptions } from "./usecases/user/get-upgrade-options.usecase.js";
import { CancelSubscription } from "./usecases/admin/cancel-subscription.usecase.js";
import { ExtendSubscription } from "./usecases/admin/extend-subscription.usecase.js";
import { ResyncSubscription } from "./usecases/admin/resync-subscription.usecase.js";

import { ForceExpireSubscription } from "./usecases/admin/force-expire-subscription.usecase.js";
import { ExpireSubscriptions } from "./usecases/system/expire-subscriptions.usecase.js";

import { SendSubscriptionReminder } from "./usecases/system/send-subscription-reminder.usecase.js";

import { SubscriptionController } from "./controllers/subscription.controller.js";
import { AdminController } from "./controllers/admin.controller.js";

export function registerSubscription(container) {
	container.register({
		subscriptionRepository: asClass(SubscriptionRepositoryMongo).singleton(),

		subscribe: asClass(Subscribe).scoped(),
		getMySubscriptions: asClass(GetMySubscriptions).scoped(),

		adminCreateSubscription: asClass(AdminCreateSubscription).scoped(),
		getAllSubscriptions: asClass(GetAllSubscriptions).scoped(),
		getSubscriptionById: asClass(GetSubscriptionById).scoped(),
		getUpgradeOptions: asClass(GetUpgradeOptions).scoped(),
		adminSuspendSubscription: asClass(AdminSuspendSubscription).scoped(),
		adminResumeSubscription: asClass(AdminResumeSubscription).scoped(),
		cancelSubscription: asClass(CancelSubscription).scoped(),
		extendSubscription: asClass(ExtendSubscription).scoped(),
		resyncSubscription: asClass(ResyncSubscription).scoped(),
		forceExpireSubscription: asClass(ForceExpireSubscription).scoped(),

		expireSubscriptions: asClass(ExpireSubscriptions).scoped(),
		sendSubscriptionReminder: asClass(SendSubscriptionReminder).scoped(),

		subscriptionController: asClass(SubscriptionController).scoped(),
		subscriptionAdminController: asClass(AdminController).scoped()
	});
}