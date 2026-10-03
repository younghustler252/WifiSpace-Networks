// subscription/usecases/system/send-subscription-reminder.usecase.js
import { SUBSCRIPTION_STATUSES } from "../../domain/subscription.enum.js";

const REMINDER_DAYS_BEFORE = [3, 1];

export class SendSubscriptionReminder {
	constructor({ subscriptionRepository, accountRepository, createNotification }) {
		this.subscriptionRepository = subscriptionRepository;
		this.accountRepository = accountRepository;
		this.createNotification = createNotification;
	}

	async execute() {
		let sentCount = 0;

		for (const daysBefore of REMINDER_DAYS_BEFORE) {
			const windowStart = new Date();
			windowStart.setDate(windowStart.getDate() + daysBefore);
			windowStart.setHours(0, 0, 0, 0);

			const windowEnd = new Date(windowStart);
			windowEnd.setHours(23, 59, 59, 999);

			const docs = await this.subscriptionRepository.model.find({
				status: SUBSCRIPTION_STATUSES.ACTIVE,
				expiresAt: { $gte: windowStart, $lte: windowEnd },
				remindersSent: { $ne: daysBefore }
			}).lean();

			for (const raw of docs) {
				try {
					const subscription = this.subscriptionRepository.mapOne(raw);
					const account = await this.accountRepository.findById(subscription.accountId);
					if (!account) continue;

					await this.createNotification.execute({
						actorId: null,
						type: "subscription_expiring",
						title: `Your ${subscription.planSnapshot.name} plan expires in ${daysBefore} day(s)`,
						message: `Your subscription expires on ${new Date(subscription.expiresAt).toLocaleDateString()}. Renew soon to avoid interruption.`,
						userIds: [subscription.userId],
						accountId: account.id
					});

					subscription.remindersSent.push(daysBefore);
					await this.subscriptionRepository.update(subscription.id, subscription);
					sentCount++;
				} catch (err) {
					console.error(`[SendSubscriptionReminder] Failed for subscription ${raw._id}:`, err.message);
				}
			}
		}

		return { sentCount };
	}
}