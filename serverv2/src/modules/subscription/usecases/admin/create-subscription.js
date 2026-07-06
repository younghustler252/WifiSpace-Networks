import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { PlanBillingCalculator } from "../../domain/plan-billing-calculator.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class AdminCreateSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		planRepository,
		adminRecordPayment,
		subscriptionQueue
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.adminRecordPayment = adminRecordPayment;
		this.subscriptionQueue = subscriptionQueue;
	}

	async execute({
		accountId,
		userId,
		planId,
		status = "active",
		cycles = 1,
		overrideExisting = false,
		startsAt,
		manualAdjustmentDays = 0,
		autoRenewEnabled = false,
		adminId,
		reason,
		paymentAmount,
		paymentChannel = "bank_transfer",
		currency = "NGN",
		adminNote = null,
		context = {}
	}) {
		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!accountId) throw new ValidationError("accountId is required");
		if (!userId) throw new ValidationError("userId is required");
		if (!planId) throw new ValidationError("planId is required");
		if (cycles < 1) throw new ValidationError("cycles must be at least 1");

		const allowedStatuses = ["active", "expired", "suspended", "canceled"];
		if (!allowedStatuses.includes(status)) {
			throw new ValidationError("Invalid subscription status");
		}

		const startDate = startsAt ? new Date(startsAt) : new Date();

		if (isNaN(startDate.getTime())) {
			throw new ValidationError("Invalid startsAt");
		}

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

		if (!plan) {
			throw new NotFoundError("Plan not found");
		}

		// -----------------------------
		// RECORD PAYMENT (OPTIONAL)
		// -----------------------------
		let savedPayment = null;

		if (paymentAmount) {
			savedPayment = await this.adminRecordPayment.execute({
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
		// BILLING
		// -----------------------------
		const billing = PlanBillingCalculator.calculate(plan, cycles);

		const expiresAt = PlanBillingCalculator.calculateExpiryDate(
			plan,
			cycles,
			startDate,
			manualAdjustmentDays
		);

		const graceEndsAt = plan.gracePeriodDays
			? new Date(
					expiresAt.getTime() +
					plan.gracePeriodDays * 24 * 60 * 60 * 1000
			  )
			: null;

		// -----------------------------
		// CREATE SUBSCRIPTION
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

			startsAt: startDate,
			expiresAt,
			graceEndsAt,

			bonusDays: billing.bonusDays,
			manualAdjustmentDays,
			autoRenewEnabled,

			activatedAt: status === "active" ? startDate : null,

			lastPaymentId: savedPayment?.id || null,
			lastPaymentDate: savedPayment ? startDate : null,
			lastPaymentAmount: savedPayment ? savedPayment.amount.total : null,

			mikrotikStatus: status === "active" ? "pending" : "none",
			mikrotikError: null,

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
						paymentId: savedPayment?.id || null,
						startsAt: startDate,
						expiresAt
					}
				}
			]
		});

		// -----------------------------
		// SAVE
		// -----------------------------
		const savedSubscription =
			await this.subscriptionRepository.create(subscription);

		// -----------------------------
		// QUEUE NETWORK PROVISIONING
		// -----------------------------
		if (status === "active") {
			try {
				await this.subscriptionQueue.add("provision-network", {
					subscriptionId: savedSubscription.id,
					context: {
						...context,
						actorId: adminId || "SYSTEM_ADMIN_PROVISIONER"
					}
				});
			} catch (queueErr) {
				console.error(
					"[AdminCreateSubscriptionUseCase] Failed to dispatch provisioning job:",
					queueErr.message
				);
			}
		}

		return savedSubscription;
	}
}