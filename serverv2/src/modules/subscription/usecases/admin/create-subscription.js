import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { calculateBonusDays } from "../../domain/calculate-bonus-days.js";

export class AdminCreateSubscriptionUseCase {

	constructor({
		subscriptionRepository,
		planRepository
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
	}

	async execute({
		accountId,
		planId,

		// admin controls
		status = "active",
		cycles = 1,

		overrideExisting = false,

		startDate = new Date(),

		manualAdjustmentDays = 0,
		bonusDays: customBonusDays,

		autoRenew = false,

		gracePeriodDays = 0,

		routerProfile,

		adminId,
		reason
	}) {

		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!accountId)
			throw new ValidationError(
				"accountId is required"
			);

		if (!planId)
			throw new ValidationError(
				"planId is required"
			);

		if (cycles < 1)
			throw new ValidationError(
				"cycles must be at least 1"
			);

		const allowedStatuses = [
			"active",
			"expired",
			"suspended",
			"canceled"
		];

		if (!allowedStatuses.includes(status))
			throw new ValidationError(
				"Invalid subscription status"
			);

		// -----------------------------
		// ACTIVE SUBSCRIPTION CHECK
		// -----------------------------
		const existing =
			await this.subscriptionRepository
				.findActiveByAccount(accountId);

		if (
			existing &&
			status === "active" &&
			!overrideExisting
		) {
			throw new ValidationError(
				"Account already has an active subscription"
			);
		}

		// -----------------------------
		// PLAN
		// -----------------------------
		const plan =
			await this.planRepository.findById(
				planId
			);

		if (!plan)
			throw new NotFoundError(
				"Plan not found"
			);

		// -----------------------------
		// DATES
		// -----------------------------
		const normalizedStartDate =
			new Date(startDate);

		const baseEndDate =
			new Date(normalizedStartDate);

		baseEndDate.setDate(
			baseEndDate.getDate() +
				plan.durationDays * cycles
		);

		// -----------------------------
		// BONUS DAYS
		// -----------------------------
		const calculatedBonusDays =
			calculateBonusDays(plan, cycles);

		const finalBonusDays =
			typeof customBonusDays === "number"
				? customBonusDays
				: calculatedBonusDays;

		// -----------------------------
		// FINAL END DATE
		// -----------------------------
		const endDate = new Date(baseEndDate);

		endDate.setDate(
			endDate.getDate() +
				finalBonusDays +
				manualAdjustmentDays
		);

		// -----------------------------
		// STATUS DATES
		// -----------------------------
		const suspendedAt =
			status === "suspended"
				? new Date()
				: undefined;

		const canceledAt =
			status === "canceled"
				? new Date()
				: undefined;

		// -----------------------------
		// CREATE
		// -----------------------------
		const subscription =
			await this.subscriptionRepository.create({
				accountId,
				planId,

				planSnapshot: {
					name: plan.name,
					price: plan.price,
					durationDays:
						plan.durationDays,
					speedRate:
						plan.speedRate,
					devicesAllowed:
						plan.devicesAllowed
				},

				startDate:
					normalizedStartDate,

				baseEndDate,
				endDate,

				status,

				billingCycle:
					plan.billingCycle,

				cycles,

				totalAmount:
					plan.price * cycles,

				bonusDays:
					finalBonusDays,

				manualAdjustmentDays,

				autoRenew,

				gracePeriodDays,

				routerProfile,

				suspendedAt,
				canceledAt,

				payments: [],

				events: [
					{
						type: "created",
						date: new Date(),

						metadata: {
							source: "admin",

							adminId,

							reason,

							planName:
								plan.name,

							price:
								plan.price,

							status,

							cycles,

							bonusDays:
								finalBonusDays,

							manualAdjustmentDays,

							overrideExisting
						}
					}
				]
			});

		return subscription;
	}
}