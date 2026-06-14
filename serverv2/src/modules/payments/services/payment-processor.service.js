import { ValidationError } from "../../../shared/errors/validation-error.js";
import { AppError } from "../../../shared/errors/app-error.js";

export class paymentProcessorService {

	constructor({
		paymentRepository,
		subscriptionRepository,
		planRepository,

		createSubscription,
		renewSubscription,
		upgradeSubscription
	}) {

		this.paymentRepository =
			paymentRepository;

		this.subscriptionRepository =
			subscriptionRepository;

		this.planRepository =
			planRepository;

		this.createSubscription =
			createSubscription;

		this.renewSubscription =
			renewSubscription;

		this.upgradeSubscription =
			upgradeSubscription;
	}

	// =====================================================
	// PROCESS PAYMENT BUSINESS LOGIC
	// =====================================================
	async process(payment) {

		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!payment) {

			throw new ValidationError(
				"Payment is required"
			);
		}

		if (!payment.isSuccessful()) {

			throw new AppError(
				"Only successful payments can be processed",
				400
			);
		}

		// already processed
		if (payment.businessProcessed) {

			return payment;
		}

		// -----------------------------
		// FIND ACTIVE SUBSCRIPTION
		// -----------------------------
		const activeSubscription =
			await this.subscriptionRepository
				.findActiveByAccount(
					payment.accountId
				);

		// =====================================================
		// CASE 1: NO ACTIVE SUBSCRIPTION
		// =====================================================
		if (!activeSubscription) {

			const subscription =
				await this.createSubscription.execute({
					accountId: payment.accountId,
					userId: payment.userId,
					planId: payment.planId,
					paymentId: payment.id,
					cycles: payment.cycles
				});

			payment.attachSubscription(
				subscription.id
			);
		}

		// =====================================================
		// CASE 2: ACTIVE SUB EXISTS
		// =====================================================
		else {

			// normalize IDs
			const activePlanId =
				typeof activeSubscription.planId === "object"
					? (
						activeSubscription.planId._id ||
						activeSubscription.planId.id
					)?.toString()
					: activeSubscription.planId?.toString();

			const paymentPlanId =
				typeof payment.planId === "object"
					? (
						payment.planId._id ||
						payment.planId.id
					)?.toString()
					: payment.planId?.toString();

			const samePlan =
				activePlanId === paymentPlanId;

			
			// ----------------------------------
			// RENEW
			// ----------------------------------
			if (samePlan) {

				await this.renewSubscription.execute({
					subscriptionId:
						activeSubscription.id,

					paymentId:
						payment.id,

					cycles:
						payment.cycles
				});

				payment.attachSubscription(
					activeSubscription.id
				);
			}

			// ----------------------------------
			// UPGRADE
			// ----------------------------------
			else {

				const currentPlan =
					await this.planRepository
						.findById(activePlanId);

				const newPlan =
					await this.planRepository
						.findById(paymentPlanId);

				if (
					!currentPlan ||
					!newPlan
				) {

					throw new AppError(
						"Plan not found",
						404
					);
				}

				// block downgrade
				if (
					newPlan.price <
					currentPlan.price
				) {

					throw new ValidationError(
						"Downgrades are not allowed"
					);
				}

				// same price but different plan
				if (
					newPlan.price ===
					currentPlan.price
				) {

					throw new ValidationError(
						"Selected plan is already active"
					);
				}

				await this.upgradeSubscription.execute({
					subscriptionId:
						activeSubscription.id,

					newPlanId:
						paymentPlanId,

					paymentId:
						payment.id
				});

				payment.attachSubscription(
					activeSubscription.id
				);
			}
		}

		// -----------------------------
		// MARK PROCESSED
		// -----------------------------
		payment.markBusinessProcessed();

		// -----------------------------
		// SAVE PAYMENT
		// -----------------------------
		return await this.paymentRepository
			.update(payment);
	}
}