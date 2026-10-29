import { NodemailerService } from "./nodemailer.service.js";
import { BrevoService } from "./brevo.service.js";
import otpTemplate from "../templates/otp.templates.js";
import notificationTemplate from "../templates/notification.templates.js";
import passwordChangedTemplate from "../templates/password-changed.templates.js";

export class MailService {
	constructor() {
		this.client =
			process.env.NODE_ENV === "production"
				? new BrevoService()
				: new NodemailerService();
	}

	async deliver({ to, subject, html, text }) {
		if (!to || (Array.isArray(to) && to.length === 0)) {
			throw new Error("Email recipient is missing");
		}
		return this.client.send({ to, subject, html, text });
	}

	async sendOTP({ to, name, otp, expiresIn = 10 }) {
		const mail = otpTemplate({ name, otp, expiresIn, purpose: "verify" });
		return this.deliver({ to, ...mail });
	}

	async sendPasswordResetOTP({ to, name, otp, expiresIn = 10 }) {
		const mail = otpTemplate({ name, otp, expiresIn, purpose: "reset" });
		return this.deliver({ to, ...mail });
	}

	async sendPasswordChangedNotice({ to, name }) {
		const mail = passwordChangedTemplate({ name });
		return this.deliver({ to, ...mail });
	}

	async sendNotification({ to, name, subject, title, message, action = null }) {
		const mail = notificationTemplate({
			name,
			title: String(title ?? "").trim() || String(subject ?? "").trim(),
			message,
			action
		});
		const customSubject = String(subject ?? "").trim() || String(title ?? "").trim();
		return this.deliver({ to, ...mail, subject: customSubject || mail.subject });
	}
}
