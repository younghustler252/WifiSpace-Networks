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

	async execute({ actorId, accountId, planId, cycles = 1, paymentChannel = "cash", note = null, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (plan.serviceType !== account.serviceType) throw new ValidationError("Plan does not match account service type");

		const existingSub = await this.subscriptionRepository.findCurrentByAccountId(accountId);
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
			metadata: { recordedByAdmin: actorId, note }
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