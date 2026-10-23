import { SUBSCRIPTION_STATUSES } from "../../../subscription/domain/subscription.enum.js";
import { PAYMENT_ACTIONS } from "../../domain/payment.enum.js";
import { Subscription } from "../../../subscription/domain/subscription.entity.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";
import { NOTIFICATION_TYPES } from "../../../notifications/domain/notification.enum.js";

const CHANNEL_MAP = { card: "card", bank: "bank_transfer", bank_transfer: "bank_transfer", eft: "bank_transfer", ussd: "ussd", qr: "qr", mobile_money: "mobile_money" };

export class ProcessSuccessfulPayment {
	constructor({ paymentRepository, subscriptionRepository, planRepository, accountRepository, networkService, confirmHotspot, auditService, createNotification }) {
		this.paymentRepository = paymentRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.accountRepository = accountRepository;
		this.networkService = networkService;
		this.confirmHotspot = confirmHotspot;
		this.auditService = auditService;
		this.createNotification = createNotification;
	}

	async execute({ payment, gatewayData = {} }) {
		if (payment.businessProcessed) return { alreadyProcessed: true, payment };

		const claimed = await this.paymentRepository.claimForProcessing(payment.id);
		if (!claimed) {
			const current = await this.paymentRepository.findById(payment.id);
			return { alreadyProcessed: true, inFlight: !current?.businessProcessed, payment: current ?? payment };
		}

		try {
			return await this._apply(claimed, gatewayData);
		} catch (error) {
			await this.paymentRepository.releaseProcessingLock(payment.id);
			throw error;
		}
	}

	async _apply(payment, gatewayData) {
		payment.markSuccessful();
		payment.metadata = { ...payment.metadata, ...gatewayData };
		payment.paymentChannel = CHANNEL_MAP[gatewayData.channel] ?? payment.paymentChannel;

		const plan = await this.planRepository.findByIdOrNull(payment.planId);
		let subscription = await this.subscriptionRepository.findCurrentByAccountId(payment.accountId);

		if (!subscription) {
			const fresh = new Subscription({
				accountId: payment.accountId, userId: payment.userId, planId: payment.planId,
				status: SUBSCRIPTION_STATUSES.PENDING, cycles: payment.cycles, totalAmount: payment.totalAmount,
				planSnapshot: plan.toSnapshot()
			});

			this._applyToSubscription(fresh, payment, plan);
			subscription = await this.subscriptionRepository.create(fresh);
		} else if (!(subscription.lastPaymentId && String(subscription.lastPaymentId) === String(payment.id))) {
			this._applyToSubscription(subscription, payment, plan);
			subscription = await this.subscriptionRepository.update(subscription.id, subscription);
		}

		payment.attachSubscription(subscription.id);
		payment.markBusinessProcessed();
		await this.paymentRepository.update(payment.id, payment);

		const account = await this.accountRepository.findById(payment.accountId);
		const provisioning = await this._provision(subscription, account, payment);

		await this.auditService?.log({
			actorId: null, actorType: "system", action: "PAYMENT_PROCESSED", entity: "Payment", entityId: payment.id,
			newValue: { subscriptionId: subscription.id, provisioning: provisioning.status }
		});

		this.createNotification?.execute({
			actorId: null, type: NOTIFICATION_TYPES.PAYMENT_RECEIVED, title: "Payment received",
			message: `Your payment of ${payment.currency} ${payment.totalAmount} was successful.`,
			userIds: [payment.userId], accountId: payment.accountId, entityType: "Payment", entityId: payment.id
		}).catch((error) => console.error("[ProcessSuccessfulPayment] Notification failed:", error.message));

		return { alreadyProcessed: false, payment, subscription, provisioning };
	}
	_applyToSubscription(subscription, payment, plan) {
		const paymentInfo = { paymentId: payment.id, paymentAmount: payment.totalAmount, paymentDate: payment.processedAt };

		if (payment.actionType === PAYMENT_ACTIONS.UPGRADE) {
			subscription.upgradeNow(plan.id, plan.toSnapshot(), { cycles: payment.cycles, ...paymentInfo });
		} else if (payment.actionType === PAYMENT_ACTIONS.RENEWAL && subscription.status !== SUBSCRIPTION_STATUSES.PENDING) {
			const bonusDays = plan.getBonusDaysForCycle(subscription.cycles + payment.cycles);
			subscription.renew({ cycles: payment.cycles, bonusDays, ...paymentInfo });
		} else {
			subscription.activate({ ...paymentInfo, startedAt: payment.metadata?.startDate ?? null });
		}
	}

	async _provision(subscription, account, payment) {
		const device = payment.metadata?.provisioning ?? {};

		if (account?.serviceType === SERVICE_TYPES.HOTSPOT && device.routerId && device.macAddress && this.confirmHotspot) {
			const result = await this.confirmHotspot.execute({ subscription, metadata: device });
			return result?.provisionResult?.provisioning ?? { status: "failed", error: "Could not queue provisioning" };
		}

		return (await this.networkService.activate(subscription, {})).provisioning;
	}
}