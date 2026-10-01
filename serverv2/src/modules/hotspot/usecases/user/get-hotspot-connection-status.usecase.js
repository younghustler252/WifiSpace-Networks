// usecases/get-hotspot-connection-status.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";

export class GetHotspotConnectionStatus {
	constructor({ paymentRepository, hotspotSessionRepository }) {
		this.paymentRepository = paymentRepository;
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ reference, macAddress }) {
		const payment = await this.paymentRepository.findByGatewayReference(reference);
		if (!payment) throw new NotFoundError("Payment not found");

		const session = macAddress ? await this.hotspotSessionRepository.findByMac(macAddress) : null;

		return {
			paymentStatus: payment.status,
			businessProcessed: payment.businessProcessed,
			connected: session?.isAuthenticated() && !session.isExpired()
		};
	}
}