import nodemailer from "nodemailer";
import { htmlToText } from "../html.js";

export class NodemailerService {
	constructor() {
		this.ready = this.init();
		this.ready.catch((err) => console.error("Nodemailer init failed:", err.message));
	}

	async init() {
		const testAccount = await nodemailer.createTestAccount();

		this.transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass
			}
		});
	}

	async send({ to, subject, html, text }) {
		await this.ready;

		const info = await this.transporter.sendMail({
			from: `"${process.env.BREVO_SENDER_NAME || "WifiSpace"}" <${process.env.BREVO_SENDER_EMAIL || "no-reply@wifispace.net"}>`,
			to,
			subject,
			html,
			text: text || htmlToText(html)
		});

		console.log("Mail preview URL:", nodemailer.getTestMessageUrl(info));
		return info;
	}
}
