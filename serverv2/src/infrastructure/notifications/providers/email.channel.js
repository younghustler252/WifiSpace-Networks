// infrastructure/notifications/providers/email.channel.js
import { NotificationChannelInterface } from "../channel.interface.js";

export class EmailChannel extends NotificationChannelInterface {
	constructor({ mailService }) {
		super();
		this.mailService = mailService;
	}
	async send({ to, subject, message }) {
		const result = await this.mailService.sendNotification({ to, subject, message });
		return { providerMessageId: result?.messageId ?? null, raw: result };
	}
}