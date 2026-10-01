// infrastructure/notifications/providers/whatsapp.channel.js
import axios from "axios";
import { NotificationChannelInterface } from "../channel.interface.js";

export class WhatsAppChannel extends NotificationChannelInterface {
	constructor({ whatsappAccessToken, whatsappPhoneNumberId }) {
		super();
		this.accessToken = whatsappAccessToken;
		this.phoneNumberId = whatsappPhoneNumberId;
	}

	// `to` must be the recipient's phone number in international format (no leading +).
	// WhatsApp requires a pre-approved message template for the first message in a
	// 24h window — free-form text only works within an already-open conversation.
	// `metadata.templateName` selects the approved template; falls back to a
	// free-form text send if omitted (will fail outside an active conversation window).
	async send({ to, message, metadata = {} }) {
		if (!this.accessToken || !this.phoneNumberId) {
			throw new Error("WhatsApp channel is not configured — missing access token or phone number ID");
		}

		const payload = metadata.templateName
			? {
					messaging_product: "whatsapp",
					to,
					type: "template",
					template: {
						name: metadata.templateName,
						language: { code: metadata.templateLanguage || "en" },
						components: metadata.templateParams
							? [{ type: "body", parameters: metadata.templateParams.map((p) => ({ type: "text", text: p })) }]
							: []
					}
				}
			: { messaging_product: "whatsapp", to, type: "text", text: { body: message } };

		const response = await axios.post(
			`https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`,
			payload,
			{ headers: { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" } }
		);

		return { providerMessageId: response.data?.messages?.[0]?.id ?? null, raw: response.data };
	}
}