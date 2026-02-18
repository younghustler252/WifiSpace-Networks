const layout = require("./layout");

module.exports = function subscriptionRenewed({ user, subscription }) {

	const content = `
		<h2>Subscription Renewed 🔄</h2>

		<p>Hi ${user.fullName},</p>

		<p>Your subscription has been renewed successfully.</p>

		<p>New expiry date:</p>

		<p><strong>${new Date(user.subscriptionEnd).toDateString()}</strong></p>
	`;

	return {
		subject: "Subscription Renewed Successfully",
		html: layout({ content }),
		text: `Your subscription has been renewed until ${new Date(user.subscriptionEnd).toDateString()}`
	};
};
