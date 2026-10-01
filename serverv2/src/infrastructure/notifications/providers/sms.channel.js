// infrastructure/notifications/providers/sms.channel.js — stub, ready for Termii/Twilio later
import { NotificationChannelInterface } from "../channel.interface.js";

export class SmsChannel extends NotificationChannelInterface {
	async send({ to, message }) {
		throw new Error("SMS channel not yet configured. Wire a provider (e.g. Termii, Twilio) here.");
	}
}