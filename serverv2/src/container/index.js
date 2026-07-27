import { createContainer } from "awilix";

/*
|--------------------------------------------------------------------------
| SHARED REGISTRARS
|--------------------------------------------------------------------------
*/
import { registerShared } from "./shared.js";
import { registerSecrets } from "./secrets.js";

/*
|--------------------------------------------------------------------------
| MODULE REGISTRARS
|--------------------------------------------------------------------------
*/
import { registerProvisioning } from "../modules/provisioning/provisioning.container.js";
import { registerDashboard } from "../modules/dashboard/dashboard.container.js";
import { registerUsage } from "../modules/usage/usage.container.js";
import { registerAnalytics } from "../modules/analytics/analytics.container.js";
import { registerRouter } from "../modules/router/router.cotainer.js";
import { registerPayment } from "../modules/payments/payment.container.js";
import { registerSubscription } from "../modules/subscription/subscription.container.js";
import { registerPlan } from "../modules/plan/plan.container.js";
import { registerHotspot } from "../modules/hotspot/hotspot.container.js";
import { registerAccount } from "../modules/account/account.container.js";
import { registerUser } from "../modules/user/user.container.js";
import { registerAuth } from "../modules/auth/auth.container.js";

/*
|--------------------------------------------------------------------------
| CONTAINER
|--------------------------------------------------------------------------
*/
export const container = createContainer({
	injectionMode: "PROXY",
	strict: true
});

/*
|--------------------------------------------------------------------------
| SHARED REGISTRATION
|--------------------------------------------------------------------------
*/
registerShared(container);

registerSecrets(container);

/*
|--------------------------------------------------------------------------
| MODULE REGISTRATION
|--------------------------------------------------------------------------
*/
const modules = [
	registerProvisioning,
	registerDashboard,
	registerRouter,
	registerPayment,
	registerSubscription,
	registerPlan,
	registerHotspot,
	registerAccount,
	registerUser,
	registerAuth,
	registerAnalytics,
	registerUsage
];

modules.forEach(register => register(container));