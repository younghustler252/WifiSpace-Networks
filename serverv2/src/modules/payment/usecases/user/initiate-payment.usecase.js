import crypto from "crypto";
import { NotFoundError, ValidationError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ACTIONS, PAYMENT_STATUSES } from "../../domain/payment.enum.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../../subscription/domain/subscription.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";
import { ACCOUNT_ERROR_CODES } from "../../../account/domain/account.enum.js";
import { Payment } from "../../domain/payment.entity.js";

export class InitiatePayment {
	constructor({ paymentRepository, subscriptionRepository, planRepository, accountRepository, userRepository, paymentGatewayRegistry, auditService }) {
		this.paymentRepository = paymentRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.paymentGatewayRegistry = paymentGatewayRegistry;
		this.auditService = auditService;
	}

	async execute({ userId, accountId, planId, cycles = 1, gateway = undefined, callbackUrl, provisioningMetadata = {}, ip = null }) {
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


		const user = await this.userRepository.findById(userId);

		const basePrice = plan.getEffectivePrice();
		const discount = plan.price - basePrice;
		const total = basePrice * cycles;

		const reference = `WSN-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
		const idempotencyKey = crypto.randomBytes(16).toString("hex");

		const payment = new Payment({
			userId, accountId, planId,
			actionType: existingSub ? PAYMENT_ACTIONS.RENEWAL : PAYMENT_ACTIONS.NEW_SUBSCRIPTION,
			amount: { total, base: basePrice * cycles, discount: discount * cycles },
			cycles, gateway: gateway || this.paymentGatewayRegistry.defaultGateway,
			gatewayReference: reference, status: PAYMENT_STATUSES.INITIATED, idempotencyKey,
			// NEW: provisioningMetadata carries whatever the caller needs surfaced
			// again at activation time — for hotspot: macAddress, routerId,
			// ipAddress captured at checkout. Empty object for PPPoE/admin flows
			// where nothing extra is needed.
			metadata: { planName: plan.name, serviceType: plan.serviceType, provisioning: provisioningMetadata }
		});

		const created = await this.paymentRepository.create(payment);

		const provider = this.paymentGatewayRegistry.get(payment.gateway);
		const gatewayResponse = await provider.initializeTransaction({
			email: user.email,
			amount: total,
			reference,
			callbackUrl,
			metadata: { paymentId: created.id, accountId, planId, userId }
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId: userId, action: "PAYMENT_INITIATED", entity: "Payment", entityId: created.id,
				newValue: { accountId, planId, total, gateway: payment.gateway }, ip
			});
		}

		return { payment: created, authorizationUrl: gatewayResponse?.data?.authorization_url ?? null, reference };
	}
}