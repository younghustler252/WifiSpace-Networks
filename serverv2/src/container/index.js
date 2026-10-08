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
import { registerTicket } from "../modules/ticket/ticket.container.js";
import { registerDashboard } from "../modules/dashboard/dashboard.container.js";
import { registerUsage } from "../modules/usage/usage.container.js";
import { registerHotspot } from "../modules/hotspot/hotspot.container.js";
// import { registerAnalytics } from "../modules/analytics/analytics.container.js";
import { registerNotifications } from "../modules/notifications/notification.container.js";
import { registerRouter } from "../modules/router/router.cotainer.js";
import { registerProvisioning } from "../modules/provisioning/provisioning.container.js";
import { registerPayment } from "../modules/payment/payment.container.js";
import { registerSubscription } from "../modules/subscription/subscription.container.js";
import { registerPlan } from "../modules/plan/plan.container.js";
import { registerAccount } from "../modules/account/account.container.js";
import { registerUser } from "../modules/user/user.container.js";
import { registerAuth } from "../modules/auth/auth.container.js";
import { registerAudit } from "../modules/audit/audit-container.js";

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
	registerTicket,
	registerNotifications,
	registerDashboard,
	registerHotspot,
	registerRouter,
	registerProvisioning,
	registerPayment,
	registerSubscription,
	registerPlan,
	registerAccount,
	registerUser,
	registerAuth,
	registerAudit,
	// registerAnalytics,
	registerUsage
];

modules.forEach(register => register(container));