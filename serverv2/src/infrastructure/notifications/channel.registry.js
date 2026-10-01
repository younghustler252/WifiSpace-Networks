// infrastructure/notifications/channel.registry.js
import { AppError } from "../../shared/errors/domain.errors.js";
import { NOTIFICATION_ERROR_CODES } from "../../modules/notification/domain/notification.enum.js";

export class NotificationChannelRegistry {
        // registry
    constructor({ emailChannel, smsChannel, whatsappChannel }) {
        this.channels = { email: emailChannel, sms: smsChannel, whatsapp: whatsappChannel };
    }
    
	get(channel) {
		const provider = this.channels[channel];
		if (!provider) throw new AppError(`Unsupported notification channel: "${channel}"`, 400, NOTIFICATION_ERROR_CODES.UNSUPPORTED_CHANNEL);
		return provider;
	}
}