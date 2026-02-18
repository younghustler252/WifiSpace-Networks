const brevo = require("@getbrevo/brevo");

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
	brevo.TransactionalEmailsApiApiKeys.apiKey,
	process.env.BREVO_API_KEY
);

// --------------------------------------------------
// Send Email
// --------------------------------------------------
async function sendEmail({ to, subject, htmlContent, textContent, tags = [] }) {

	if (!to || !subject) {
		throw new Error("Missing required email fields: to or subject");
	}

	const sender = {
		name: process.env.BREVO_SENDER_NAME,
		email: process.env.BREVO_SENDER_EMAIL
	};

	const sendSmtpEmail = new brevo.SendSmtpEmail();

	sendSmtpEmail.sender = sender;
	sendSmtpEmail.to = [{ email: to }];
	sendSmtpEmail.subject = subject;
	sendSmtpEmail.htmlContent = htmlContent;
	sendSmtpEmail.textContent = textContent || "";
	sendSmtpEmail.tags = tags;

	if (process.env.BREVO_REPLY_TO_EMAIL) {
		sendSmtpEmail.replyTo = {
			email: process.env.BREVO_REPLY_TO_EMAIL,
			name: process.env.BREVO_SENDER_NAME
		};
	}

	try {
		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

		console.log("Email sent:", response.messageId);

		return response;

	} catch (error) {
		console.error("Brevo Email Error:", error.response?.body || error.message);
		throw error;
	}
}

module.exports = {
	sendEmail
};
