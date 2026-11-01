import { NotFoundError } from "../../../../shared/errors/domain.errors.js";

export class GetMySavedCards {
	constructor({ savedCardRepository }) {
		this.savedCardRepository = savedCardRepository;
	}

	execute({ userId }) {
		return this.savedCardRepository.listByUser(userId);
	}
}

export class RemoveSavedCard {
	constructor({ savedCardRepository, subscriptionRepository, auditService }) {
		this.savedCardRepository = savedCardRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.auditService = auditService;
	}

	async execute({ userId, cardId, ip = null }) {
		const removed = await this.savedCardRepository.remove(cardId, userId);
		if (!removed) throw new NotFoundError("Card not found", "CARD_NOT_FOUND");

		const subscriptions = await this.subscriptionRepository.findByUserId(userId);
		for (const subscription of subscriptions) {
			if (subscription.autoRenewCardId !== cardId) continue;

			if (subscription.autoRenewMethod === "card") subscription.disableAutoRenew();
			else {
				subscription.autoRenewMethod = "wallet";
				subscription.autoRenewCardId = null;
			}
			await this.subscriptionRepository.update(subscription.id, subscription);
		}

		await this.auditService?.log({ actorId: userId, action: "SAVED_CARD_REMOVED", entity: "SavedCard", entityId: cardId, newValue: { last4: removed.last4 }, ip });
		return { id: cardId };
	}
}

export class SetDefaultSavedCard {
	constructor({ savedCardRepository }) {
		this.savedCardRepository = savedCardRepository;
	}

	async execute({ userId, cardId }) {
		const card = await this.savedCardRepository.setDefault(cardId, userId);
		if (!card) throw new NotFoundError("Card not found", "CARD_NOT_FOUND");
		return card;
	}
}
