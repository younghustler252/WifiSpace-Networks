export const PERMISSION = {

	USER: {
		UPDATE_SELF: "user:update_self",
		VIEW_SELF: "user:view_self_account",
		UPDATE_PROFILE: "user:update_user_profile",
		VERIFY: "user:verify_user",
		UPDATE_ROLE: "user:update_user_role",
		DELETE: "user:delete_user",
		MANAGE_STAFF: "user:manage_staff",
		READ: "user:read_user",
		FULL_ACCESS: "*"
	},

	ACCOUNT: {
		VIEW: "account:view",
		CREATE: "account:create",
		UPDATE: "account:update",
		ACTIVATE: "account:activate",
		SUSPEND: "account:suspend",
		CANCEL: "account:cancel",

		CREATE_SUBSCRIPTION: "account:create_subscription",
		EXPIRE_SUBSCRIPTION: "account:expire_subscription",
		UPGRADE_PLAN: "account:upgrade_plan"
	},

	PLAN: {
		CREATE: "plan:create",
		UPDATE: "plan:update",
		DELETE: "plan:delete",
		VIEW: "plan:view"
	},

	// -----------------------------
	// NEW: SUBSCRIPTION
	// -----------------------------
	SUBSCRIPTION: {
		VIEW: "subscription:view",
		CREATE: "subscription:create",
		RENEW: "subscription:renew",
		UPGRADE: "subscription:upgrade",

		SUSPEND: "subscription:suspend",
		RESUME: "subscription:resume",
		CANCEL: "subscription:cancel"
	},

	// -----------------------------
	// NEW: PAYMENT
	// -----------------------------
	PAYMENT: {
		VIEW: "payment:view",
		INITIATE: "payment:initiate",
		VERIFY: "payment:verify",

		REFUND: "payment:refund",
		CANCEL: "payment:cancel"
	}
};