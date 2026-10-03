// infrastructure/notifications/providers/email.channel.js
import { NotificationChannelInterface } from "../channel.interface.js";

export class EmailChannel extends NotificationChannelInterface {
	constructor({ mailService }) {
		super();
		this.mailService = mailService;
	}
	// EmailChannel.send
	async send({ to, name, subject, message }) {
		const result = await this.mailService.sendNotification({ to, name, subject, message });
		return { providerMessageId: result?.messageId ?? null, raw: result };
	}
}