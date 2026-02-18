const subscriptionActivated = require("./subscriptionActivated");
const subscriptionRenewed = require("./subscriptionRenewed");
const subscriptionExpired = require("./subscriptionExpired");
const paymentFailed = require("./paymentFailed");
const subscriptionExpiringSoon = require("./subscriptionExpiringSoon");
const subscriptionExpiringUrgent = require("./subscriptionExpiringUrgent");	
const adminSubscriptionCreated = require("./adminSubscriptionCreated");

const templates = {
	subscription_activated: subscriptionActivated,
	subscription_renewed: subscriptionRenewed,
	subscription_expired: subscriptionExpired,
	subscription_expiring_soon: subscriptionExpiringSoon,
    subscription_expiring_urgent: subscriptionExpiringUrgent,
	payment_failed: paymentFailed,
	admin_subscription_created: adminSubscriptionCreated
};


module.exports = function getEmailTemplate(type, data) {
	const template = templates[type];
9
	if (!template) {
		throw new Error(`No email template for type: ${type}`);
	}

	return template(data);
};
