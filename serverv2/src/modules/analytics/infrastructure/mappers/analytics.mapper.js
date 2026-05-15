import { ANALYTICS_EVENTS } from "../../domain/analytics.events.js";

export function mapEventToData(event, payload = {}) {
	switch (event) {
		// ---------------- USERS ----------------
		case ANALYTICS_EVENTS.USER_CREATED:
			return {
				newUsers: 1,
				[`users_role_${payload.role || "unknown"}`]: 1
			};

		// ---------------- ACCOUNTS ----------------
		case ANALYTICS_EVENTS.ACCOUNT_CREATED:
			return {
				newAccounts: 1,

				// personal | business
				[`accounts_type_${payload.accountType || "unknown"}`]: 1,

				// pppoe | hotspot
				[`accounts_service_${payload.serviceType || "unknown"}`]: 1,

				// pending | active | suspended | canceled
				[`accounts_status_${payload.profileStatus || "unknown"}`]: 1
			};

		case ANALYTICS_EVENTS.ACCOUNT_STATUS_CHANGED:
			return {
				[`accounts_status_${payload.oldStatus}`]: -1,
				[`accounts_status_${payload.newStatus}`]: 1
			};

		case ANALYTICS_EVENTS.ACCOUNT_ONLINE:
			return {
				activeConnections: 1
			};

		case ANALYTICS_EVENTS.ACCOUNT_OFFLINE:
			return {
				activeConnections: -1
			};

		// ---------------- PAYMENTS ----------------
		case ANALYTICS_EVENTS.PAYMENT_SUCCESS:
			return {
				totalPayments: 1,
				successfulPayments: 1,
				totalRevenue: payload.amount || 0,
				[`payments_method_${payload.method || "unknown"}`]: 1
			};

		case ANALYTICS_EVENTS.PAYMENT_FAILED:
			return {
				totalPayments: 1,
				failedPayments: 1
			};

		// ---------------- SUBSCRIPTIONS ----------------
		case ANALYTICS_EVENTS.SUBSCRIPTION_CREATED:
			return {
				newSubscriptions: 1,
				activeSubscriptions: 1,
				[`subscriptions_plan_${payload.plan || "unknown"}`]: 1
			};

		case ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRED:
			return {
				activeSubscriptions: -1,
				expiredSubscriptions: 1
			};

		default:
			return null;
	}
}