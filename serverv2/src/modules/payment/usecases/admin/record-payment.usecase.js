// payment/usecases/admin/record-payment.usecase.js — generalized for renewal too
import crypto from "crypto";
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ACTIONS, PAYMENT_STATUSES, PAYMENT_GATEWAYS } from "../../domain/payment.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";
import { ACCOUNT_ERROR_CODES } from "../../../account/domain/account.enum.js";
import { Payment } from "../../domain/payment.entity.js";

export class RecordPayment {
	constructor({ paymentRepository, planRepository, accountRepository, subscriptionRepository, processSuccessfulPayment, auditService }) {
		this.paymentRepository = paymentRepository;
		this.planRepository = planRepository;
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.processSuccessfulPayment = processSuccessfulPayment;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, planId, cycles = 1, paymentChannel = "cash", note = null, startDate = null, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (plan.serviceType !== account.serviceType) throw new ValidationError("Plan does not match account service type");

		const existingSub = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (startDate) {
			if (existingSub) throw new ValidationError("A start date can only be set when recording the first payment for an account");
			if (new Date(startDate) > new Date()) throw new ValidationError("Start date cannot be in the future");

			const endsAt = new Date(startDate).getTime() + plan.getDurationSeconds() * 1000 * cycles;
			if (endsAt <= Date.now()) {
				throw new ValidationError("That start date is too far back: the plan would already have expired. Choose a later start date or more cycles.");
			}
		}

		const actionType = existingSub?.status === "active" ? PAYMENT_ACTIONS.RENEWAL : PAYMENT_ACTIONS.NEW_SUBSCRIPTION;

		const basePrice = plan.getEffectivePrice();
		const discount = plan.price - basePrice;
		const total = basePrice * cycles;

		const payment = new Payment({
			userId: account.userId, accountId, planId, actionType,
			amount: { total, base: basePrice * cycles, discount: discount * cycles },
			cycles, gateway: PAYMENT_GATEWAYS.CASH, paymentChannel,
			gatewayReference: `MANUAL-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
			status: PAYMENT_STATUSES.PENDING,
			paymentDate: startDate ? new Date(startDate) : new Date(),
			metadata: { recordedByAdmin: actorId, note, startDate: startDate ? new Date(startDate).toISOString() : null }
		});

		const created = await this.paymentRepository.create(payment);
		const result = await this.processSuccessfulPayment.execute({ payment: created, gatewayData: { channel: paymentChannel } });

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: actionType === PAYMENT_ACTIONS.RENEWAL ? "SUBSCRIPTION_RENEWED_VIA_MANUAL_PAYMENT" : "PAYMENT_RECORDED_MANUALLY",
				entity: "Payment", entityId: created.id, newValue: { accountId, planId, total, paymentChannel, note }, ip
			});
		}

		return result;
	}
}