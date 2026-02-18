const layout = require("./layout");
const escapeHtml = require("../../utils/escapeHtml");

module.exports = function subscriptionExpiringSoon({ subscription }) {
    const content = `
        <h2>Subscription Expiring Soon ⏰</h2>

        <p>Hi ${escapeHtml(subscription.userFullName)},</p>

        <p>Your subscription plan <strong>${escapeHtml(subscription.planName)}</strong> is set to expire in 2 days on <strong>${new Date(subscription.endDate).toDateString()}</strong>.</p>

        <p>Please renew in time to avoid service interruption.</p>
    `;

    return {
        subject: "Your Subscription Expires in 2 Days",
        html: layout({ content }),
        text: `Hi ${subscription.userFullName}, your ${subscription.planName} subscription expires in 2 days on ${new Date(subscription.endDate).toDateString()}.`
    };
};
