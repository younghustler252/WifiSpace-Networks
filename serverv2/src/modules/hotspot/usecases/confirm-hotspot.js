import { HotspotSession } from "../domain/hotspot-session.entity.js";

export class ConfirmHotspotPurchase {
	constructor({
		confirmPayment,
		hotspotSessionRepository
	}) {
		this.confirmPayment = confirmPayment;
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ reference }) {
		const result = await this.confirmPayment.execute({ reference });

		if (!result?.success) {
			return result;
		}

		// CHANGED: was `const { user, account } = result` — result is
		// ConfirmPaymentUseCase's return, { success, payment, gatewayResponse,
		// alreadyProcessed, result, autoConnected } — there is no top-level
		// user/account on that. account lives nested at result.result.account
		// (from PaymentBusinessProcessor), and user wasn't returned from that
		// chain at all until the fix just made to
		// payment-business-processor.service.js.
		const user = result.result?.user;
		const account = result.result?.account;

		if (!user || !account) {
			return result;
		}

		
		const metadata = result.payment?.metadata || {};
		const { macAddress, ipAddress, userAgent, routerId } = metadata;

		if (!macAddress) {
			return result;
		}

		let session = await this.hotspotSessionRepository.findByMac(macAddress);

		if (!session) {
			session = await this.hotspotSessionRepository.create(
				new HotspotSession({
					userId: user.id,
					accountId: account.id,
					routerId,
					macAddress,
					ipAddress,
					userAgent,
					status: "authenticated",
					trustedDevice: true,
					lastSeenAt: new Date()
				})
			);
		} else {
			session.authenticate({
				userId: user.id,
				accountId: account.id,
				routerId,
				ipAddress,
				userAgent
			});

			session = await this.hotspotSessionRepository.update(session.id, session);
		}

		return { ...result, session };
	}
}