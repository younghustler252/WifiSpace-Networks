import { Notification } from "../../domain/notification.entity.js";
import { NotificationRecipient } from "../../domain/notification-recipient.entity.js";
import { NOTIFICATION_TYPES, NOTIFICATION_CHANNEL, NOTIFICATION_PRIORITY } from "../../domain/notification.enum.js";
import { USER_ROLE } from "../../../user/domain/user.enum.js";

export class SendSystemAlert {
	constructor({ notificationRepository, notificationRecipientRepository, userRepository }) {
		this.notificationRepository = notificationRepository;
		this.notificationRecipientRepository = notificationRecipientRepository;
		this.userRepository = userRepository;
	}

	async execute({ title, message }) {
		const { data: superadmins } = await this.userRepository.paginate({ filter: { role: USER_ROLE.SUPERADMIN }, limit: 50 });

		const notification = new Notification({ type: NOTIFICATION_TYPES.SYSTEM_ALERT, title, message, channel: NOTIFICATION_CHANNEL.EMAIL });
		const created = await this.notificationRepository.create(notification);

		for (const admin of superadmins) {
			const recipient = new NotificationRecipient({
				notificationId: created.id, userId: admin.id, channel: NOTIFICATION_CHANNEL.EMAIL, priority: NOTIFICATION_PRIORITY.CRITICAL,
				metadata: { title, message }
			});
			recipient.queue();
			await this.notificationRecipientRepository.create(recipient);
		}

		return created;
	}
}