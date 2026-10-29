import { NotificationChannelInterface } from "../channel.interface.js";

export class EmailChannel extends NotificationChannelInterface {
	constructor({ mailService }) {
		super();
		this.mailService = mailService;
	}

	async send({ to, name, subject, title, message, metadata }) {
		const result = await this.mailService.sendNotification({
			to,
			name,
			title: title ?? subject ?? metadata?.title,
			subject: subject ?? title ?? metadata?.title,
			message: message ?? metadata?.message,
			action: metadata?.action ?? null
		});
		return { providerMessageId: result?.messageId ?? null, raw: result };
	}
}
