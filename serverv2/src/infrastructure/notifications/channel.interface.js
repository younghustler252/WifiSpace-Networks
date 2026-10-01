// infrastructure/notifications/channel.interface.js
export class NotificationChannelInterface {
	async send({ to, subject, message, metadata }) {
		throw new Error("Method 'send()' must be implemented.");
	}
}