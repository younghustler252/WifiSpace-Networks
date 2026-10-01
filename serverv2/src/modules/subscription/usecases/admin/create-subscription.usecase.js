import { NotFoundError, ValidationError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES, SUBSCRIPTION_STATUSES } from "../../domain/subscription.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";
import { ACCOUNT_ERROR_CODES } from "../../../account/domain/account.enum.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class AdminCreateSubscription {
	constructor({ subscriptionRepository, planRepository, accountRepository, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.accountRepository = accountRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, planId, cycles = 1, activateImmediately = false, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (plan.serviceType !== account.serviceType) {
			throw new ValidationError("Plan does not match account service type", SUBSCRIPTION_ERROR_CODES.PLAN_SERVICE_TYPE_MISMATCH);
		}

		const existing = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (existing) throw new ConflictError("Account already has a pending or active subscription", SUBSCRIPTION_ERROR_CODES.ACCOUNT_ALREADY_HAS_ACTIVE_SUBSCRIPTION);

		const planSnapshot = {
			name: plan.name, serviceType: plan.serviceType, price: plan.getEffectivePrice(),
			durationValue: plan.durationValue, durationUnit: plan.durationUnit,
			speedRate: plan.speedRate, mikrotikProfile: plan.mikrotikProfile,
			devicesAllowed: plan.devicesAllowed, gracePeriodDays: plan.gracePeriodDays
		};

		const subscription = new Subscription({
			accountId, userId: account.userId, planId, status: SUBSCRIPTION_STATUSES.PENDING,
			planSnapshot, cycles, totalAmount: planSnapshot.price * cycles
		});

		if (activateImmediately) {
			const bonusDays = plan.getBonusDaysForCycle(cycles);
			subscription.bonusDays = bonusDays;
			subscription.activate();
		}

		const created = await this.subscriptionRepository.create(subscription);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "SUBSCRIPTION_CREATED_BY_ADMIN", entity: "Subscription", entityId: created.id,
				newValue: { accountId, planId, activateImmediately }, ip
			});
		}

		return created;
	}
}