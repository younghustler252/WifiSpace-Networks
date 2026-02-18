const layout = require("./layout");
const escapeHtml = require("../../utils/escapeHtml");

module.exports = function subscriptionExpiringUrgent({ subscription }) {
    const content = `
        <h2>Subscription Expiring Tomorrow ⚠️</h2>

        <p>Hi ${escapeHtml(subscription.userFullName)},</p>

        <p>Your subscription plan <strong>${escapeHtml(subscription.planName)}</strong> will expire tomorrow on <strong>${new Date(subscription.endDate).toDateString()}</strong>.</p>

        <p>Renew now to avoid service interruption 🔔</p>
    `;

    return {
        subject: "Your Subscription Expires Tomorrow",
        html: layout({ content }),
        text: `Hi ${subscription.userFullName}, your ${subscription.planName} subscription expires tomorrow on ${new Date(subscription.endDate).toDateString()}. Renew now to continue uninterrupted.`
    };
};
