import { NOTIFICATION_TYPES } from "../../../notifications/domain/notification.enum.js";

const LEAD_MS = Number(process.env.AUTO_RENEW_LEAD_MINUTES || 60) * 60 * 1000;
const RETRY_MS = Number(process.env.AUTO_RENEW_RETRY_MINUTES || 20) * 60 * 1000;
const NOTIFY_EVERY_MS = 24 * 60 * 60 * 1000;

const METHODS = {
	wallet: ["wallet"],
	card: ["card"],
	wallet_then_card: ["wallet", "card"]
};

const formatNaira = (value) => `₦${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

export class AutoRenewSubscriptions {
	constructor({ subscriptionRepository, planRepository, walletRepository, payWithWallet, chargeSavedCard, createNotification }) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.walletRepository = walletRepository;
		this.payWithWallet = payWithWallet;
		this.chargeSavedCard = chargeSavedCard;
		this.createNotification = createNotification;
	}

	async execute({ userId = null, retryMs = RETRY_MS } = {}) {
		const due = await this.subscriptionRepository.findDueForAutoRenewal({ now: new Date(), leadMs: LEAD_MS, userId });
		const summary = { checked: due.length, renewed: 0, failed: 0, skipped: 0 };

		for (const candidate of due) {
			const claimed = await this.subscriptionRepository.claimAutoRenewAttempt(candidate.id, { now: new Date(), throttleMs: retryMs });
			if (!claimed) {
				summary.skipped++;
				continue;
			}

			const outcome = await this._renew(claimed);
			if (outcome.ok) summary.renewed++;
			else summary.failed++;
		}

		return summary;
	}

	async _renew(subscription) {
		const plan = await this.planRepository.findByIdOrNull(subscription.planId);
		if (!plan || !plan.isActive()) {
			await this._recordFailure(subscription, "This plan is no longer available for automatic renewal.", null);
			return { ok: false };
		}

		const price = plan.getEffectivePrice();
		const errors = [];

		for (const method of METHODS[subscription.autoRenewMethod] ?? METHODS.wallet) {
			try {
				if (method === "wallet") {
					await this.payWithWallet.execute({
						userId: subscription.userId, accountId: subscription.accountId, planId: subscription.planId, cycles: 1, autoRenew: true
					});
				} else {
					await this.chargeSavedCard.execute({
						userId: subscription.userId, accountId: subscription.accountId, planId: subscription.planId, cycles: 1,
						cardId: subscription.autoRenewCardId, autoRenew: true
					});
				}
				return { ok: true, method };
			} catch (error) {
				errors.push({ method, code: error.code, message: error.message, details: error.details });
			}
		}

		await this._recordFailure(subscription, this._describe(errors, price), { errors, price });
		return { ok: false };
	}

	_describe(errors, price) {
		const wallet = errors.find((e) => e.method === "wallet");
		const card = errors.find((e) => e.method === "card");
		const parts = [];

		if (wallet?.code === "INSUFFICIENT_BALANCE") {
			const shortfall = wallet.details?.shortfall;
			parts.push(shortfall
				? `your wallet balance is too low (${formatNaira(shortfall)} short of ${formatNaira(price)})`
				: `your wallet balance is too low for ${formatNaira(price)}`);
		} else if (wallet) {
			parts.push(`the wallet payment failed (${wallet.message})`);
		}

		if (card) parts.push(`the saved card could not be charged (${card.message})`);

		return `Automatic renewal could not complete: ${parts.join(" and ")}.`;
	}

	async _recordFailure(subscription, message, context) {
		const fresh = await this.subscriptionRepository.findById(subscription.id);
		if (!fresh) return;

		fresh.lastAutoRenewError = message;
		const now = new Date();
		const shouldNotify = !fresh.autoRenewFailureNotifiedAt || now - new Date(fresh.autoRenewFailureNotifiedAt) >= NOTIFY_EVERY_MS;
		if (shouldNotify) fresh.autoRenewFailureNotifiedAt = now;

		await this.subscriptionRepository.update(fresh.id, fresh);

		if (!shouldNotify) return;

		const expires = fresh.expiresAt ? new Date(fresh.expiresAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "soon";
		const topUp = context?.errors?.some((e) => e.code === "INSUFFICIENT_BALANCE") ? " Top up your wallet and we will renew it automatically." : "";

		await this.createNotification.execute({
			actorId: null,
			type: NOTIFICATION_TYPES.PAYMENT_FAILED,
			title: "We could not renew your plan automatically",
			message: `${message}${topUp}\n\nYour ${fresh.planSnapshot.name} plan ends on ${expires}. Renew it manually to stay connected.`,
			userIds: [fresh.userId],
			accountId: fresh.accountId
		}).catch((error) => console.error("[AutoRenew] Failure notice not sent:", error.message));
	}
}
