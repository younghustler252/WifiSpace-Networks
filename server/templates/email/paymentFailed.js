const layout = require("./layout");
const escapeHtml = require("../../utils/escapeHtml");

module.exports = function paymentFailed({ user, retryUrl }) {

	const safeName = escapeHtml(user.fullName);

	const content = `
		<h2>Payment Failed ❌</h2>

		<p>Hi ${safeName},</p>

		<p>Your recent payment attempt was unsuccessful.</p>

		<p>
			Please <a href="${retryUrl}">retry your payment</a>
			or contact support if the issue persists.
		</p>
  `;

	return {
		subject: "Payment Attempt Failed",
		html: layout({ content }),
		text: `
		Hi ${user.fullName},

		Your recent payment attempt was unsuccessful.

		Please retry your payment or contact support.
		`
  	};
};
