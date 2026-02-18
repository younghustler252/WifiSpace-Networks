const layout = require("./layout");
const escapeHtml = require("escape-html"); // optional but recommended

module.exports = function adminSubscriptionCreated({ user, subscription, reference }) {

	const content = `
		<h2>New Subscription Created 🚀</h2>

		<p>A new subscription has been created by ${escapeHtml(user.fullName)} (${escapeHtml(user.email)}).</p>

		<table width="100%" cellpadding="6" cellspacing="0" style="margin-top: 15px; border-collapse: collapse;">
			<tr>
				<td><strong>User:</strong></td>
				<td>${escapeHtml(user.fullName)}</td>
			</tr>
			<tr>
				<td><strong>Email:</strong></td>
				<td>${escapeHtml(user.email)}</td>
			</tr>
			<tr>
				<td><strong>Plan:</strong></td>
				<td>${escapeHtml(subscription.planName)}</td>
			</tr>
			<tr>
				<td><strong>Price:</strong></td>
				<td>₦${subscription.price}</td>
			</tr>
			<tr>
				<td><strong>Reference:</strong></td>
				<td>${escapeHtml(reference)}</td>
			</tr>
		</table>

		<p style="margin-top: 20px;">
			Please review and take necessary actions.
		</p>
	`;

	return {
		subject: "New Subscription Payment Received",
		html: layout({ content }),
		text: `New subscription created by ${user.fullName} for ${subscription.planName} plan. Reference: ${reference}`
	};
};
