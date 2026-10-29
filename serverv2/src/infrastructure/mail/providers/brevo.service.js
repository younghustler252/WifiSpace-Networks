import axios from "axios";
import { htmlToText } from "../html.js";

export class BrevoService {
	constructor() {
		if (!process.env.BREVO_API_KEY) {
			throw new Error("Missing BREVO_API_KEY");
		}

		if (!process.env.BREVO_SENDER_EMAIL || !process.env.BREVO_SENDER_NAME) {
			throw new Error("Missing sender env vars");
		}

		this.apiKey = process.env.BREVO_API_KEY;

		this.sender = {
			email: process.env.BREVO_SENDER_EMAIL,
			name: process.env.BREVO_SENDER_NAME,
		};
	}

	async send({ to, subject, html, text }) {
		try {
			const response = await axios.post(
				"https://api.brevo.com/v3/smtp/email",
				{
					sender: this.sender,
					to: Array.isArray(to)
						? to.map(email => ({ email }))
						: [{ email: to }],
					subject: subject || this.sender.name,
					htmlContent: html,
					textContent: text || htmlToText(html),
				},
				{
					headers: {
						"api-key": this.apiKey,
						"Content-Type": "application/json",
					},
				}
			);

			return { ...response.data, messageId: response.data?.messageId ?? null };
		} catch (err) {
			console.error(
				"Brevo email error:",
				err?.response?.data || err.message
			);
			throw err;
		}
	}
}
