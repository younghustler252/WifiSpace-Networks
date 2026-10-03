import { asClass } from "awilix";

import { NotificationRepositoryMongo } from "./repositories/notification.repository.mongo.js";
import { NotificationRecipientRepositoryMongo } from "./repositories/notification-recipient.repository.mongo.js";

import { EmailChannel } from "../../infrastructure/notifications/providers/email.channel.js";
import { SmsChannel } from "../../infrastructure/notifications/providers/sms.channel.js";
import { InAppChannel } from "../../infrastructure/notifications/providers/in-app.channel.js";
import { WhatsAppChannel } from "../../infrastructure/notifications/providers/whatsapp.channel.js";
import { NotificationChannelRegistry } from "../../infrastructure/notifications/channel.registry.js";
import { AdminController } from "./controllers/admin.controller.js";

import { CreateNotification } from "./usecases/admin/create-notification.usecase.js";
import { GetAllNotifications } from "./usecases/admin/get-all-notifications.usecase.js";
import { GetMyNotifications } from "./usecases/user/get-my-notifications.usecase.js";
import { MarkNotificationRead } from "./usecases/user/mark-read.usecase.js";
import { DispatchNotifications } from "./usecases/system/dispatch-notifications.usecase.js";
import { SendSystemAlert } from "./usecases/system/send-system-alert.usecase.js";

import { NotificationController } from "./controllers/notification.controller.js";
// ...
export function registerNotifications(container) {
    container.register({
        notificationRepository: asClass(NotificationRepositoryMongo).singleton(),
		notificationRecipientRepository: asClass(NotificationRecipientRepositoryMongo).singleton(),
        
		emailChannel: asClass(EmailChannel).singleton(),
		smsChannel: asClass(SmsChannel).singleton(),
        whatsappChannel: asClass(WhatsAppChannel).singleton(),
		inAppChannel: asClass(InAppChannel).singleton(),
		channelRegistry: asClass(NotificationChannelRegistry).singleton(),

		createNotification: asClass(CreateNotification).scoped(),
		getAllNotifications: asClass(GetAllNotifications).scoped(),
		getMyNotifications: asClass(GetMyNotifications).scoped(),
		markNotificationRead: asClass(MarkNotificationRead).scoped(),
		dispatchNotifications: asClass(DispatchNotifications).scoped(),
		sendSystemAlert: asClass(SendSystemAlert).scoped(),

        notificationController: asClass(NotificationController).scoped(),
		notificationAdminController: asClass(AdminController).scoped()
	});
}