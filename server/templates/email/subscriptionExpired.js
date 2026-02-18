const layout = require("./layout");
const escapeHtml = require("../../utils/escapeHtml");

module.exports = function subscriptionExpired({ user, renewalUrl }) {

	const safeName = escapeHtml(user.fullName);
	const expiryDate = new Date(user.subscriptionEnd).toDateString();

	const content = `
		<h2>Subscription Expired ⚠️</h2>

		<p>Hi ${safeName},</p>

		<p>
			Your subscription expired on:
		</p>

		<p>
			<strong>${expiryDate}</strong>
		</p>

		<p>
			To continue enjoying uninterrupted service, please renew your
			subscription as soon as possible.
		</p>

		<p style="margin-top:20px;">
			<a href="${renewalUrl}" 
			   style="display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">
				Renew Subscription
			</a>
		</p>

		<p style="margin-top:20px;">
			If you need any assistance, our support team is always ready to help.
		</p>
	`;

	return {
		subject: "Your Subscription Has Expired",
		html: layout({ content }),
		text: `
Hi ${user.fullName},

Your subscription expired on ${expiryDate}.

To restore your service, please renew your subscription as soon as possible.

Renew here:
${renewalUrl}

If you need assistance, please contact support.

We look forward to having you back.
`
	};
};
