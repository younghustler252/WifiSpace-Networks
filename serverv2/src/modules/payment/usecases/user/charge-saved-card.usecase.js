import crypto from "crypto";
import { NotFoundError, ValidationError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { Payment } from "../../domain/payment.entity.js";
import { resolveActionType } from "../../domain/resolve-action-type.js";
import { PAYMENT_STATUSES, PAYMENT_GATEWAYS, PAYMENT_CHANNELS } from "../../domain/payment.enum.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../../subscription/domain/subscription.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";
import { ACCOUNT_ERROR_CODES } from "../../../account/domain/account.enum.js";

const PENDING_CHARGE_WINDOW_MS = 60 * 60 * 1000;

export class ChargeSavedCard {
	constructor({ paymentRepository, subscriptionRepository, planRepository, accountRepository, savedCardRepository, paymentGatewayRegistry, processSuccessfulPayment, auditService }) {
		this.paymentRepository = paymentRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.accountRepository = accountRepository;
		this.savedCardRepository = savedCardRepository;
		this.paymentGatewayRegistry = paymentGatewayRegistry;
		this.processSuccessfulPayment = processSuccessfulPayment;
		this.auditService = auditService;
	}

	async execute({ userId, accountId, planId, cycles = 1, cardId = null, autoRenew = false }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);
		if (account.userId !== userId) throw new ValidationError("You do not have access to this account");

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (!plan.isActive()) throw new ValidationError("This plan is not currently available", SUBSCRIPTION_ERROR_CODES.PLAN_NOT_ACTIVE);

		const card = cardId
			? await this.savedCardRepository.findForCharge(cardId, userId)
			: await this.savedCardRepository.findDefaultForCharge(userId);
		if (!card) throw new ValidationError("No saved card is available. Pay once with your card to save it.", "NO_SAVED_CARD");
		if (card.expired) throw new ValidationError(`The card ending ${card.last4} has expired`, "CARD_EXPIRED");

		const existingSub = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (existingSub?.status === "pending") {
			throw new ConflictError("A subscription checkout is already pending for this account", SUBSCRIPTION_ERROR_CODES.ACCOUNT_ALREADY_HAS_ACTIVE_SUBSCRIPTION);
		}

		const inFlight = await this.paymentRepository.model.exists({
			accountId, gateway: PAYMENT_GATEWAYS.PAYSTACK, status: PAYMENT_STATUSES.PENDING,
			"metadata.savedCardCharge": true, createdAt: { $gte: new Date(Date.now() - PENDING_CHARGE_WINDOW_MS) }
		});
		if (inFlight) throw new ConflictError("A card charge for this account is still being confirmed", "CARD_CHARGE_PENDING");

		const actionType = resolveActionType({ existingSub, plan });
		const unitPrice = plan.getEffectivePrice();
		const total = unitPrice * cycles;
		if (total <= 0) throw new ValidationError("This plan has no price to charge");

		const reference = `WSN-C-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

		const payment = await this.paymentRepository.create(new Payment({
			userId, accountId, planId, actionType,
			amount: { total, base: plan.price * cycles, discount: (plan.price - unitPrice) * cycles },
			cycles,
			gateway: PAYMENT_GATEWAYS.PAYSTACK,
			paymentChannel: PAYMENT_CHANNELS.CARD,
			gatewayReference: reference,
			status: PAYMENT_STATUSES.INITIATED,
			idempotencyKey: crypto.randomBytes(16).toString("hex"),
			metadata: { planName: plan.name, serviceType: plan.serviceType, savedCardCharge: true, cardLast4: card.last4, ...(autoRenew ? { autoRenew: true } : {}) }
		}));

		const provider = this.paymentGatewayRegistry.get(PAYMENT_GATEWAYS.PAYSTACK);
		let result;
		try {
			result = await provider.chargeAuthorization({
				email: card.email, amount: total, authorizationCode: card.authorizationCode, reference,
				metadata: { paymentId: payment.id, accountId, planId, autoRenew }
			});
		} catch (error) {
			payment.markFailed(error.message);
			await this.paymentRepository.update(payment.id, payment);
			throw error;
		}

		if (result.status === PAYMENT_STATUSES.PENDING) {
			payment.status = PAYMENT_STATUSES.PENDING;
			await this.paymentRepository.update(payment.id, payment);
			throw new ValidationError("The card charge is still being confirmed. We will apply it as soon as the bank responds.", "CARD_CHARGE_PENDING");
		}

		if (result.status !== PAYMENT_STATUSES.SUCCESSFUL) {
			payment.markFailed(result.message || "The card was declined");
			await this.paymentRepository.update(payment.id, payment);
			throw new ValidationError(result.message || "The card was declined", "CARD_CHARGE_FAILED");
		}

		if (result.amountKobo != null && result.amountKobo !== Math.round(total * 100)) {
			payment.markFailed("Charged amount did not match");
			await this.paymentRepository.update(payment.id, payment);
			throw new ValidationError("The charged amount did not match the plan price", "CARD_AMOUNT_MISMATCH");
		}

		const outcome = await this.processSuccessfulPayment.execute({
			payment, gatewayData: { channel: "card", authorization: result.authorization, customerEmail: result.customerEmail }
		});

		await this.savedCardRepository.touch(card.id);

		await this.auditService?.log({
			actorId: userId, action: autoRenew ? "PAYMENT_CARD_AUTO_RENEW" : "PAYMENT_SAVED_CARD", entity: "Payment", entityId: payment.id,
			newValue: { accountId, planId, total, cardLast4: card.last4 }
		});

		return { payment: outcome.payment ?? payment, outcome, card: { id: card.id, last4: card.last4, brand: card.brand } };
	}
}
