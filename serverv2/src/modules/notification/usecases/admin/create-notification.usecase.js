import { ValidationError } from "../../../../shared/errors/domain.errors.js";
import { NOTIFICATION_ERROR_CODES } from "../../domain/notification.enum.js";
import { Notification } from "../../domain/notification.entity.js";
import { NotificationRecipient } from "../../domain/notification-recipient.entity.js";
import { NOTIFICATION_CHANNEL, NOTIFICATION_PRIORITY } from "../../domain/notification.enum.js";
import { USER_ROLE } from "../../../user/domain/user.enum.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";
import { SUBSCRIPTION_STATUSES } from "../../../subscription/domain/subscription.enum.js";

export class CreateNotification {
	constructor({ notificationRepository, notificationRecipientRepository, userRepository, accountRepository, subscriptionRepository, hotspotSessionRepository, routerProvisioningRepository, auditService }) {
		this.notificationRepository = notificationRepository;
		this.notificationRecipientRepository = notificationRecipientRepository;
		this.userRepository = userRepository;
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, type, title, message, userIds, audience, routerIds, sinceHours = 24, channel = NOTIFICATION_CHANNEL.EMAIL, priority = NOTIFICATION_PRIORITY.NORMAL, accountId = null, preview = false, ip = null }) {
		if (!userIds?.length && !audience && !routerIds?.length) {
			throw new ValidationError("One of userIds, audience, or routerIds is required");
		}

		const targetUserIds = routerIds?.length
			? await this._resolveByRouters(routerIds, sinceHours)
			: audience
				? await this._resolveAudience(audience)
				: userIds;

		if (!targetUserIds.length) {
			throw new ValidationError("This selection matches no recipients", NOTIFICATION_ERROR_CODES.NO_RECIPIENTS_RESOLVED);
		}

		if (preview) {
			return { recipientCount: targetUserIds.length };
		}

		const notification = new Notification({ createdByAdminId: actorId, accountId, type, title, message, channel, recipientCount: targetUserIds.length });
		let created = await this.notificationRepository.create(notification);

		for (const userId of targetUserIds) {
			const recipient = new NotificationRecipient({ notificationId: created.id, userId, channel, priority, metadata: { title, message, type, accountId } });
			recipient.queue();
			await this.notificationRecipientRepository.create(recipient);
		}

		created.startProcessing();
		created = await this.notificationRepository.update(created.id, created);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "NOTIFICATION_CREATED", entity: "Notification", entityId: created.id,
				newValue: { type, recipientCount: targetUserIds.length, routerIds: routerIds ?? null }, ip
			});
		}

		return created;
	}

	async _resolveAudience(audience) {
		if (audience !== "all_customers") throw new ValidationError(`Unsupported audience: ${audience}`);
		const ids = [];
		let page = 1;
		while (true) {
			const { data, meta } = await this.userRepository.paginate({ filter: { role: USER_ROLE.CUSTOMER }, page, limit: 200 });
			ids.push(...data.map((u) => u.id));
			if (page >= meta.totalPages) break;
			page++;
		}
		return ids;
	}

	async _resolveByRouters(routerIds, sinceHours) {
		const userIds = new Set();

		// PPPoE: account.routerId is a direct, fixed relationship.
		for (const routerId of routerIds) {
			const { data: pppoeAccounts } = await this.accountRepository.paginate({ filter: { serviceType: SERVICE_TYPES.PPPOE, routerId, status: "active" }, limit: 1000 });
			for (const account of pppoeAccounts) userIds.add(account.userId);
		}

		// Hotspot: no fixed router — look at who's been provisioned on these
		// routers recently via RouterProvisioning (synced within sinceHours),
		// cross-referenced against an active subscription.
		for (const routerId of routerIds) {
			const provisionings = await this.routerProvisioningRepository.findByRouter(routerId, { status: "synced" });
			const cutoff = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

			for (const p of provisionings) {
				if (!p.lastSyncedAt || new Date(p.lastSyncedAt) < cutoff) continue;
				const subscription = await this.subscriptionRepository.findCurrentByAccountId(p.accountId);
				if (subscription?.isActive() || subscription?.isInGracePeriod()) {
					userIds.add(subscription.userId);
				}
			}
		}

		return Array.from(userIds);
	}
}