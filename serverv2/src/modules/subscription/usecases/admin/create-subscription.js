import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { PlanBillingCalculator } from "../../domain/plan-billing-calculator.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class AdminCreateSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		planRepository,
		adminRecordPaymentUseCase, // <-- injected
		provisionNetworkAccountUseCase // <-- injected
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.adminRecordPaymentUseCase = adminRecordPaymentUseCase;
		this.provisionNetworkAccountUseCase = provisionNetworkAccountUseCase;
	}

	async execute({
		accountId,
		userId,
		planId,
		status = "active",
		cycles = 1,
		overrideExisting = false,
		startsAt = new Date(),
		manualAdjustmentDays = 0,
		autoRenewEnabled = false,
		adminId,
		reason,
		paymentAmount, // { total, base, discount }
		paymentChannel = "bank_transfer",
		currency = "NGN",
		adminNote = null
	}) {
		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!accountId) throw new ValidationError("accountId is required");
		if (!userId) throw new ValidationError("userId is required");
		if (!planId) throw new ValidationError("planId is required");
		if (cycles < 1) throw new ValidationError("cycles must be at least 1");

		const allowedStatuses = ["active", "expired", "suspended", "canceled"];
		if (!allowedStatuses.includes(status)) throw new ValidationError("Invalid subscription status");

		// -----------------------------
		// PREVENT DUPLICATE ACTIVE SUBSCRIPTION
		// -----------------------------
		const existing = await this.subscriptionRepository.findActiveByAccount(accountId);
		if (existing && status === "active" && !overrideExisting) {
			throw new ValidationError("Account already has an active subscription");
		}

		// -----------------------------
		// FETCH PLAN
		// -----------------------------
		const plan = await this.planRepository.findById(planId);
		if (!plan) throw new NotFoundError("Plan not found");

		// -----------------------------
		// RECORD PAYMENT (if provided)
		// -----------------------------
		let savedPayment = null;
		if (paymentAmount) {
			savedPayment = await this.adminRecordPaymentUseCase.execute({
				userId,
				accountId,
				planId,
				amount: paymentAmount,
				currency,
				paymentChannel,
				adminNote
			});
		}

		// -----------------------------
		// BILLING CALCULATION
		// -----------------------------
		const billing = PlanBillingCalculator.calculate(plan, cycles);
		const expiresAt = new Date(startsAt.getTime() + (billing.totalDays + manualAdjustmentDays) * 86400000);
		const graceEndsAt = plan.gracePeriodDays
			? new Date(expiresAt.getTime() + plan.gracePeriodDays * 24 * 60 * 60 * 1000)
			: null;

		// -----------------------------
		// CREATE SUBSCRIPTION ENTITY
		// -----------------------------
		const subscription = new Subscription({
			accountId,
			userId,
			planId,
			planSnapshot: {
				name: plan.name,
				serviceType: plan.serviceType,
				price: plan.price,
				durationValue: plan.durationValue,
				durationUnit: plan.durationUnit,
				speedRate: plan.speedRate,
				mikrotikProfile: plan.mikrotikProfile,
				devicesAllowed: plan.devicesAllowed,
				gracePeriodDays: plan.gracePeriodDays
			},
			status,
			cycles,
			totalAmount: plan.price * cycles,
			startsAt,
			expiresAt,
			graceEndsAt,
			bonusDays: billing.bonusDays,
			manualAdjustmentDays,
			autoRenewEnabled,
			activatedAt: status === "active" ? new Date() : null,
			lastPaymentId: savedPayment?.id || null,
			lastPaymentDate: savedPayment ? new Date() : null,
			lastPaymentAmount: savedPayment ? savedPayment.amount.total : null,
			events: [
				{
					type: "created",
					date: new Date(),
					metadata: {
						source: "admin",
						adminId,
						reason,
						planName: plan.name,
						price: plan.price,
						status,
						cycles,
						bonusDays: billing.bonusDays,
						manualAdjustmentDays,
						overrideExisting,
						paymentId: savedPayment?.id || null
					}
				}
			]
		});

		// -----------------------------
		// SAVE SUBSCRIPTION
		// -----------------------------
		const savedSubscription = await this.subscriptionRepository.create(subscription);

		// -----------------------------
		// OPTIONAL: PROVISION NETWORK ACCOUNT
		// -----------------------------
		if (status === "active" && this.provisionNetworkAccountUseCase) {
			try {
				await this.provisionNetworkAccountUseCase.execute(savedSubscription.id, { actorId: adminId });
			} catch (err) {
				console.error("Provisioning failed:", err.message);
			}
		}

		return savedSubscription;
	}
}