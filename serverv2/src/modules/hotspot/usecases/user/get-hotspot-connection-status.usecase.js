import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ERROR_CODES, PAYMENT_STATUSES } from "../../../payment/domain/payment.enum.js";

const VERIFY_THROTTLE_SECONDS = 4;

export class GetHotspotConnectionStatus {
	constructor({ paymentRepository, subscriptionRepository, hotspotSessionRepository, paymentGatewayRegistry, processSuccessfulPayment, redisClient }) {
		this.paymentRepository = paymentRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.paymentGatewayRegistry = paymentGatewayRegistry;
		this.processSuccessfulPayment = processSuccessfulPayment;
		this.redisClient = redisClient;
	}

	async execute({ reference, macAddress = null }) {
		let payment = await this.paymentRepository.findByGatewayReference(reference);
		if (!payment) throw new NotFoundError("Payment not found", PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND);

		if (payment.isPending()) payment = await this._reconcile(payment);

		const base = { paymentStatus: payment.status, businessProcessed: payment.businessProcessed, connected: false };

		if (payment.isFailed() || payment.isExpired()) return { ...base, stage: "payment_failed" };
		if (!payment.businessProcessed) return { ...base, stage: "awaiting_payment" };

		const subscription = payment.subscriptionId ? await this.subscriptionRepository.findById(payment.subscriptionId) : null;
		if (!subscription || !subscription.isActive()) return { ...base, stage: "provisioning" };
		if (subscription.mikrotikStatus === "failed") return { ...base, stage: "provisioning_failed" };

		const deviceMac = payment.metadata?.provisioning?.macAddress ?? macAddress;
		const session = deviceMac ? await this.hotspotSessionRepository.findByMac(deviceMac) : null;
		const connected = subscription.mikrotikStatus === "synced" && Boolean(session?.isAuthenticated() && !session.isExpired());

		return { ...base, connected, stage: connected ? "connected" : "provisioning", expiresAt: subscription.expiresAt };
	}

	async _reconcile(payment) {
		const acquired = await this.redisClient.set(`hotspot-verify:${payment.id}`, "1", "EX", VERIFY_THROTTLE_SECONDS, "NX");
		if (!acquired) return payment;

		try {
			const provider = this.paymentGatewayRegistry.get(payment.gateway);
			const result = await provider.verifyTransaction(payment.gatewayReference);

			if (result.status === PAYMENT_STATUSES.SUCCESSFUL) {
				const processed = await this.processSuccessfulPayment.execute({ payment, gatewayData: { channel: result.raw?.channel } });
				return processed.payment ?? payment;
			}
		} catch (error) {
			console.error(`[HotspotStatus] Gateway check failed for ${payment.gatewayReference}:`, error.message);
		}

		return payment;
	}
}