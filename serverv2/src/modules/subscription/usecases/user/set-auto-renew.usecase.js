import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../domain/subscription.enum.js";
import { toKobo } from "../../../../shared/utils/money.js";

export class SetAutoRenew {
	constructor({ subscriptionRepository, planRepository, walletRepository, savedCardRepository, autoRenewSubscriptions, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.walletRepository = walletRepository;
		this.savedCardRepository = savedCardRepository;
		this.autoRenewSubscriptions = autoRenewSubscriptions;
		this.auditService = auditService;
	}

	async execute({ actorId, userId = null, subscriptionId, enabled, method = "wallet", cardId = null, ip = null }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription || (userId && subscription.userId !== userId)) {
			throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);
		}

		if (!enabled) {
			subscription.disableAutoRenew();
			await this.subscriptionRepository.update(subscription.id, subscription);
			await this._audit(actorId, subscription, { enabled: false }, ip);
			return this._view(subscription);
		}

		let resolvedCardId = null;
		if (method !== "wallet") {
			const card = cardId
				? await this.savedCardRepository.findForCharge(cardId, subscription.userId)
				: await this.savedCardRepository.findDefaultForCharge(subscription.userId);
			if (!card) throw new ValidationError("No saved card is available. Pay once with your card to save it.", "NO_SAVED_CARD");
			if (card.expired) throw new ValidationError(`The card ending ${card.last4} has expired`, "CARD_EXPIRED");
			resolvedCardId = card.id;
		}

		subscription.enableAutoRenew({ method, cardId: resolvedCardId });
		await this.subscriptionRepository.update(subscription.id, subscription);
		await this._audit(actorId, subscription, { enabled: true, method, cardId: resolvedCardId }, ip);

		this.autoRenewSubscriptions.execute({ userId: subscription.userId }).catch((error) => console.error("[SetAutoRenew] Immediate run failed:", error.message));

		return this._view(subscription);
	}

	async _view(subscription) {
		const plan = await this.planRepository.findByIdOrNull(subscription.planId);
		const price = plan?.getEffectivePrice() ?? subscription.planSnapshot.price;
		const wallet = await this.walletRepository.findByUserId(subscription.userId);
		const balanceKobo = wallet?.balanceKobo ?? 0;
		const shortfallKobo = Math.max(0, toKobo(price) - balanceKobo);

		return {
			subscriptionId: subscription.id,
			autoRenewEnabled: subscription.autoRenewEnabled,
			method: subscription.autoRenewEnabled ? subscription.autoRenewMethod : null,
			cardId: subscription.autoRenewCardId,
			nextRenewalDate: subscription.nextRenewalDate,
			renewalPrice: price,
			walletBalance: balanceKobo / 100,
			walletShortfall: shortfallKobo / 100,
			lastError: subscription.lastAutoRenewError
		};
	}

	_audit(actorId, subscription, payload, ip) {
		return this.auditService?.log({
			actorId, action: "SUBSCRIPTION_AUTO_RENEW_CHANGED", entity: "Subscription", entityId: subscription.id, newValue: payload, ip
		});
	}
}
