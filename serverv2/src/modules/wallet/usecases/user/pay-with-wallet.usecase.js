import crypto from "crypto";
import { NotFoundError, ValidationError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { toKobo } from "../../../../shared/utils/money.js";
import { Payment } from "../../../payment/domain/payment.entity.js";
import { resolveActionType } from "../../../payment/domain/resolve-action-type.js";
import { PAYMENT_STATUSES, PAYMENT_GATEWAYS, PAYMENT_CHANNELS } from "../../../payment/domain/payment.enum.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../../subscription/domain/subscription.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";
import { ACCOUNT_ERROR_CODES } from "../../../account/domain/account.enum.js";
import { WALLET_TX_TYPES, WALLET_TX_SOURCES } from "../../domain/wallet.enum.js";

export class PayWithWallet {
	constructor({ walletRepository, paymentRepository, subscriptionRepository, planRepository, accountRepository, processSuccessfulPayment, auditService }) {
		this.walletRepository = walletRepository;
		this.paymentRepository = paymentRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.accountRepository = accountRepository;
		this.processSuccessfulPayment = processSuccessfulPayment;
		this.auditService = auditService;
	}

	async execute({ userId, accountId, planId, cycles = 1, actionTypeOverride, provisioningMetadata = {}, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);
		if (account.userId !== userId) throw new ValidationError("You do not have access to this account");

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (!plan.isActive()) throw new ValidationError("This plan is not currently available", SUBSCRIPTION_ERROR_CODES.PLAN_NOT_ACTIVE);
		if (plan.serviceType !== account.serviceType) {
			throw new ValidationError("Plan does not match account service type", SUBSCRIPTION_ERROR_CODES.PLAN_SERVICE_TYPE_MISMATCH);
		}

		const existingSub = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (existingSub?.status === "pending") {
			throw new ConflictError("A subscription checkout is already pending for this account", SUBSCRIPTION_ERROR_CODES.ACCOUNT_ALREADY_HAS_ACTIVE_SUBSCRIPTION);
		}

		const actionType = resolveActionType({ existingSub, plan, override: actionTypeOverride });

		const unitPrice = plan.getEffectivePrice();
		const total = unitPrice * cycles;
		const totalKobo = toKobo(total);
		if (totalKobo <= 0) throw new ValidationError("This plan has no price to charge from the wallet");

		const wallet = await this.walletRepository.ensureWallet(userId);
		if (wallet.balanceKobo < totalKobo) {
			throw new ValidationError("Insufficient wallet balance", "INSUFFICIENT_BALANCE", {
				balance: wallet.balanceKobo / 100,
				required: total,
				shortfall: (totalKobo - wallet.balanceKobo) / 100
			});
		}

		const reference = `WSN-W-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

		const payment = await this.paymentRepository.create(new Payment({
			userId, accountId, planId, actionType,
			amount: { total, base: plan.price * cycles, discount: (plan.price - unitPrice) * cycles },
			cycles,
			gateway: PAYMENT_GATEWAYS.WALLET,
			paymentChannel: PAYMENT_CHANNELS.WALLET,
			gatewayReference: reference,
			status: PAYMENT_STATUSES.INITIATED,
			idempotencyKey: crypto.randomBytes(16).toString("hex"),
			metadata: { planName: plan.name, serviceType: plan.serviceType, provisioning: provisioningMetadata }
		}));

		try {
			await this.walletRepository.apply({
				userId,
				type: WALLET_TX_TYPES.DEBIT,
				amountKobo: totalKobo,
				source: WALLET_TX_SOURCES.PAYMENT,
				reference: `pay:${payment.id}`,
				description: `${plan.name} x${cycles}`,
				metadata: { paymentId: payment.id, accountId, planId }
			});
		} catch (error) {
			payment.markFailed(error.message);
			await this.paymentRepository.update(payment.id, payment);
			throw error;
		}

		let outcome;
		try {
			outcome = await this.processSuccessfulPayment.execute({ payment, gatewayData: { channel: "wallet" } });
		} catch (error) {
			await this.walletRepository.apply({
				userId,
				type: WALLET_TX_TYPES.CREDIT,
				amountKobo: totalKobo,
				source: WALLET_TX_SOURCES.PAYMENT_ROLLBACK,
				reference: `pay-rollback:${payment.id}`,
				description: `Refund for failed activation of ${plan.name}`,
				metadata: { paymentId: payment.id }
			});

			const fresh = await this.paymentRepository.findById(payment.id);
			if (fresh && !fresh.businessProcessed) {
				fresh.markFailed(`Activation failed: ${error.message}`);
				await this.paymentRepository.update(fresh.id, fresh);
			}

			throw error;
		}

		await this.auditService?.log({
			actorId: userId, action: "PAYMENT_WALLET", entity: "Payment", entityId: payment.id,
			newValue: { accountId, planId, total }, ip
		});

		const finalWallet = await this.walletRepository.findByUserId(userId);
		return { payment: outcome.payment ?? payment, outcome, balance: finalWallet.balanceKobo / 100 };
	}
}
