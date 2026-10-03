// infrastructure/notifications/providers/in-app.channel.js
import { NotificationChannelInterface } from "../channel.interface.js";

export class InAppChannel extends NotificationChannelInterface {
	async send() {
		return { providerMessageId: null, raw: null };
	}
}