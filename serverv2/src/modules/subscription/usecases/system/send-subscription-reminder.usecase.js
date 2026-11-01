// subscription/usecases/system/send-subscription-reminder.usecase.js
import { SUBSCRIPTION_STATUSES } from "../../domain/subscription.enum.js";
import { toKobo } from "../../../../shared/utils/money.js";

const REMINDER_DAYS_BEFORE = [3, 1];

export class SendSubscriptionReminder {
	constructor({ subscriptionRepository, accountRepository, createNotification, planRepository, walletRepository }) {
		this.planRepository = planRepository;
		this.walletRepository = walletRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.accountRepository = accountRepository;
		this.createNotification = createNotification;
	}

	async _messageFor(subscription) {
		const expires = new Date(subscription.expiresAt).toLocaleDateString("en-NG", { dateStyle: "medium" });
		const manual = `Your subscription expires on ${expires}. Renew soon to avoid interruption.`;
		if (!subscription.autoRenewEnabled) return manual;

		const plan = await this.planRepository.findByIdOrNull(subscription.planId);
		const price = plan?.getEffectivePrice() ?? subscription.planSnapshot.price;
		const usesWallet = subscription.autoRenewMethod !== "card";
		const usesCard = subscription.autoRenewMethod !== "wallet";

		if (usesWallet) {
			const wallet = await this.walletRepository.findByUserId(subscription.userId);
			const balanceKobo = wallet?.balanceKobo ?? 0;
			const shortfallKobo = toKobo(price) - balanceKobo;
			if (shortfallKobo > 0 && !usesCard) {
				return `Your plan renews automatically on ${expires}, but your wallet is ₦${(shortfallKobo / 100).toLocaleString("en-NG")} short of the ₦${Number(price).toLocaleString("en-NG")} renewal price. Top up your wallet before then to stay connected.`;
			}
			if (shortfallKobo > 0) {
				return `Your plan renews automatically on ${expires}. Your wallet is ₦${(shortfallKobo / 100).toLocaleString("en-NG")} short, so we will charge your saved card instead.`;
			}
			return `Your plan renews automatically on ${expires}. ₦${Number(price).toLocaleString("en-NG")} will be taken from your wallet.`;
		}

		return `Your plan renews automatically on ${expires}. ₦${Number(price).toLocaleString("en-NG")} will be charged to your saved card.`;
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
						message: await this._messageFor(subscription),
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