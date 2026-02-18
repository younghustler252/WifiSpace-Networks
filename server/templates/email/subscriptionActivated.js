const layout = require("./layout");
const escapeHtml = require("../../utils/escapeHtml");

module.exports = function subscriptionActivated({ user, subscription }) {

    const safeName = escapeHtml(user.fullName);
    const safePlan = escapeHtml(subscription.planName);
    const safeSpeed = escapeHtml(subscription.speedRate);
    const safePrice = escapeHtml(String(subscription.price));

    // Use subscription dates passed in metadata
    const startDate = new Date(subscription.startDate).toLocaleDateString("en-ZA", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });

    const endDate = new Date(subscription.endDate).toLocaleDateString("en-ZA", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });

    const content = `
        <h2>Subscription Activated 🚀</h2>

        <p>Hi ${safeName},</p>

        <p>
            Great news! Your subscription has been successfully activated and is now live.
            Below are your plan details:
        </p>

        <table width="100%" cellpadding="6" cellspacing="0" style="margin-top:15px; border-collapse: collapse;">
            <tr>
                <td><strong>Plan:</strong></td>
                <td>${safePlan}</td>
            </tr>
            <tr>
                <td><strong>Speed:</strong></td>
                <td>${safeSpeed}</td>
            </tr>
            <tr>
                <td><strong>Price:</strong></td>
                <td>₦${safePrice}</td>
            </tr>
            <tr>
                <td><strong>Start Date:</strong></td>
                <td>${startDate}</td>
            </tr>
            <tr>
                <td><strong>Expiry Date:</strong></td>
                <td>${endDate}</td>
            </tr>
        </table>

        <p style="margin-top:20px;">
            You can now enjoy uninterrupted access. If you have any questions
            or need assistance, our support team is always here to help.
        </p>

        <p>
            Enjoy your experience 🔥
        </p>
    `;

    return {
        subject: `Your ${safePlan} Plan Is Now Active`,
        html: layout({ content }),
        text: `
Hi ${user.fullName},

Your subscription has been successfully activated.

Plan Details:
- Plan: ${subscription.planName}
- Speed: ${subscription.speedRate}
- Price: ₦${subscription.price}
- Start Date: ${startDate}
- Expiry Date: ${endDate}

You can now enjoy uninterrupted access.

If you need any help, please contact support.

Thank you for choosing us.
`
    };
};
