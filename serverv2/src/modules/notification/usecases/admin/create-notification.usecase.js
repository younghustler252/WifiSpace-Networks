// notifications/usecases/admin/create-notification.usecase.js
import { ValidationError } from "../../../../shared/errors/domain.errors.js";
import { Notification } from "../../domain/notification.entity.js";
import { NotificationRecipient } from "../../domain/notification-recipient.entity.js";
import { NOTIFICATION_CHANNEL, NOTIFICATION_PRIORITY } from "../../domain/notification.enum.js";
import { USER_ROLE } from "../../../user/domain/user.enum.js";

export class CreateNotification {
	constructor({ notificationRepository, notificationRecipientRepository, userRepository, auditService }) {
		this.notificationRepository = notificationRepository;
		this.notificationRecipientRepository = notificationRecipientRepository;
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, type, title, message, userIds, audience, channel = NOTIFICATION_CHANNEL.EMAIL, priority = NOTIFICATION_PRIORITY.NORMAL, accountId = null, ip = null }) {
		if (!userIds?.length && !audience) {
			throw new ValidationError("Either userIds or audience is required");
		}

		const notification = new Notification({ createdByAdminId: actorId, accountId, type, title, message, channel });
		let created = await this.notificationRepository.create(notification);

		const targetUserIds = audience ? await this._resolveAudience(audience) : userIds;

		for (const userId of targetUserIds) {
			const recipient = new NotificationRecipient({
				notificationId: created.id, userId, channel, priority,
				metadata: { title, message }
			});
			recipient.queue();
			await this.notificationRecipientRepository.create(recipient);
		}

		created.startProcessing();
		created = await this.notificationRepository.update(created.id, created);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "NOTIFICATION_CREATED", entity: "Notification", entityId: created.id,
				newValue: { type, recipientCount: targetUserIds.length }, ip
			});
		}

		return created;
	}

	async _resolveAudience(audience) {
		if (audience === "all_customers") {
			const ids = [];
			let page = 1;
			const limit = 200;

			while (true) {
				const { data, meta } = await this.userRepository.paginate({ filter: { role: USER_ROLE.CUSTOMER }, page, limit });
				ids.push(...data.map((u) => u.id));
				if (page >= meta.totalPages) break;
				page++;
			}

			return ids;
		}

		throw new ValidationError(`Unsupported audience: ${audience}`);
	}
}