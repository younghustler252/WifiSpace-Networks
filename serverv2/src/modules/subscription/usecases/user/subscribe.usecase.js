import { NotFoundError, ValidationError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES, SUBSCRIPTION_STATUSES } from "../../domain/subscription.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";
import { ACCOUNT_ERROR_CODES } from "../../../account/domain/account.enum.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class Subscribe {
	constructor({ subscriptionRepository, planRepository, accountRepository, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.accountRepository = accountRepository;
		this.auditService = auditService;
	}

	async execute({ userId, accountId, planId, cycles = 1, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);
		if (account.userId !== userId) throw new ValidationError("You do not have access to this account");

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (!plan.isActive()) throw new ValidationError("This plan is not currently available", SUBSCRIPTION_ERROR_CODES.PLAN_NOT_ACTIVE);
		if (plan.serviceType !== account.serviceType) {
			throw new ValidationError("Plan does not match account service type", SUBSCRIPTION_ERROR_CODES.PLAN_SERVICE_TYPE_MISMATCH);
		}

		const existing = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (existing) throw new ConflictError("Account already has a pending or active subscription", SUBSCRIPTION_ERROR_CODES.ACCOUNT_ALREADY_HAS_ACTIVE_SUBSCRIPTION);

		const planSnapshot = {
			name: plan.name, serviceType: plan.serviceType, price: plan.getEffectivePrice(),
			durationValue: plan.durationValue, durationUnit: plan.durationUnit,
			speedRate: plan.speedRate, mikrotikProfile: plan.mikrotikProfile, ipoeProfile: plan.ipoeProfile,
			devicesAllowed: plan.devicesAllowed, gracePeriodDays: plan.gracePeriodDays
		};

		const subscription = new Subscription({
			accountId, userId, planId, status: SUBSCRIPTION_STATUSES.PENDING,
			planSnapshot, cycles, totalAmount: planSnapshot.price * cycles
		});

		const created = await this.subscriptionRepository.create(subscription);

		if (this.auditService) {
			await this.auditService.log({
				actorId: userId, action: "SUBSCRIPTION_CREATED", entity: "Subscription", entityId: created.id,
				newValue: { accountId, planId, totalAmount: created.totalAmount }, ip
			});
		}

		return created;
	}
}