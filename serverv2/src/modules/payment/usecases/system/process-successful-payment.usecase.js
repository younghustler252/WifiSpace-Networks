import { SUBSCRIPTION_STATUSES } from "../../../subscription/domain/subscription.enum.js";
import { PAYMENT_ACTIONS } from "../../domain/payment.enum.js";
import { Subscription } from "../../../subscription/domain/subscription.entity.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

export class ProcessSuccessfulPayment {
	constructor({ paymentRepository, subscriptionRepository, planRepository, accountRepository, networkService, confirmHotspot, auditService, mailService }) {
		this.paymentRepository = paymentRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.accountRepository = accountRepository;
		this.networkService = networkService;
		this.confirmHotspot = confirmHotspot; // NEW
		this.auditService = auditService;
		this.mailService = mailService;
	}

	async execute({ payment, gatewayData = {} }) {
		if (payment.businessProcessed) {
			return { alreadyProcessed: true, payment };
		}

		payment.markSuccessful();
		payment.metadata = { ...payment.metadata, ...gatewayData };

		let subscription = await this.subscriptionRepository.findCurrentByAccountId(payment.accountId);

		if (!subscription) {
			const plan = await this.planRepository.findByIdOrNull(payment.planId);

			subscription = new Subscription({
				accountId: payment.accountId,
				userId: payment.userId,
				planId: payment.planId,
				status: SUBSCRIPTION_STATUSES.PENDING,
				cycles: payment.cycles,
				totalAmount: payment.totalAmount,
				planSnapshot: {
					name: plan.name,
					serviceType: plan.serviceType,
					price: plan.getEffectivePrice(),
					durationValue: plan.durationValue,
					durationUnit: plan.durationUnit,
					speedRate: plan.speedRate,
					mikrotikProfile: plan.mikrotikProfile,
					devicesAllowed: plan.devicesAllowed,
					gracePeriodDays: plan.gracePeriodDays
				}
			});

			subscription.activate({
				paymentId: payment.id,
				paymentAmount: payment.totalAmount,
				paymentDate: payment.processedAt
			});

			subscription = await this.subscriptionRepository.create(subscription);
		}

		if (payment.actionType === PAYMENT_ACTIONS.UPGRADE) {
			const newPlan = await this.planRepository.findByIdOrNull(payment.planId);
			subscription.upgradeNow(payment.planId, {
				name: newPlan.name, serviceType: newPlan.serviceType, price: newPlan.getEffectivePrice(),
				durationValue: newPlan.durationValue, durationUnit: newPlan.durationUnit,
				speedRate: newPlan.speedRate, mikrotikProfile: newPlan.mikrotikProfile,
				devicesAllowed: newPlan.devicesAllowed, gracePeriodDays: newPlan.gracePeriodDays
			});
		} else if (payment.actionType === PAYMENT_ACTIONS.RENEWAL && subscription.status !== SUBSCRIPTION_STATUSES.PENDING) {
			const plan = await this.planRepository.findByIdOrNull(subscription.planId);
			const bonusDays = plan?.getBonusDaysForCycle(subscription.cycles + 1) ?? 0;
			subscription.renew({ bonusDays, paymentId: payment.id, paymentAmount: payment.totalAmount, paymentDate: payment.processedAt });
		} else {
			subscription.activate({ paymentId: payment.id, paymentAmount: payment.totalAmount, paymentDate: payment.processedAt });
		}

		subscription = await this.subscriptionRepository.update(subscription.id, subscription);

		payment.attachSubscription(subscription.id);
		payment.markBusinessProcessed();
		await this.paymentRepository.update(payment.id, payment);

		const account = await this.accountRepository.findById(payment.accountId);

		let provisionResult;

		// NEW: hotspot accounts need macAddress/routerId (captured at checkout,
		// carried on payment.metadata.provisioning) to know WHICH router to
		// provision — a plain networkService.activate(subscription, {}) has no
		// way to resolve that on its own for a roaming hotspot account.
		if (account?.serviceType === SERVICE_TYPES.HOTSPOT && this.confirmHotspot) {
			const provisioningMeta = payment.metadata?.provisioning ?? {};
			const hotspotResult = await this.confirmHotspot.execute({ subscription, metadata: provisioningMeta });
			provisionResult = hotspotResult?.provisionResult ?? { success: false, error: "Missing provisioning metadata" };
		} else {
			provisionResult = await this.networkService.activate(subscription, {});
		}

		if (this.auditService) {
			await this.auditService.log({
				actorId: null, actorType: "system", action: "PAYMENT_PROCESSED", entity: "Payment", entityId: payment.id,
				newValue: { subscriptionId: subscription.id, provisioned: provisionResult.success }
			});
		}

		if (this.mailService && account?.user?.email) {
			this.mailService.sendNotification({
				to: account.user.email, subject: "Payment received",
				message: `Your payment of ${payment.currency} ${payment.totalAmount} was successful. Your subscription is now active.`
			}).catch((err) => console.error("[ProcessSuccessfulPayment] Notification email failed:", err.message));
		}

		return { alreadyProcessed: false, payment, subscription, provisionResult };
	}
}
