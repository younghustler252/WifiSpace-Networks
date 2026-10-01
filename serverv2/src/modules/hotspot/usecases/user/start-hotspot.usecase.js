import { ValidationError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";

export class StartHotspot {
	constructor({ userRepository, registerHotspotUser, routerRepository, hotspotCheckoutFlow, hotspotSessionRepository }) {
		this.userRepository = userRepository;
		this.registerHotspotUser = registerHotspotUser;
		this.routerRepository = routerRepository;
		this.hotspotCheckoutFlow = hotspotCheckoutFlow;
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ firstName, lastName, email, phone, planId, callbackUrl, routerId, routerUid, identity, macAddress, ipAddress, userAgent, ip = null }) {
		if (!email) throw new ValidationError("Email is required");
		if (!macAddress) throw new ValidationError("Device MAC address is required");
		if (!callbackUrl) throw new ValidationError("callbackUrl is required");

		let user = await this.userRepository.findByEmail(email);

		if (user) {
			const trustedSession = await this.hotspotSessionRepository.findByMac(macAddress);
			const isTrustedForThisUser = trustedSession?.isTrustedFor(user.id);

			if (!isTrustedForThisUser) {
				return {
					status: "EXISTING_USER",
					requiresLogin: true,
					message: "Welcome back — please log in to continue.",
					user: { id: user.id, firstName: user.firstName, email: user.email }
				};
			}
		} else {
			user = await this.registerHotspotUser.execute({ firstName, lastName, email, phone });
		}

		const router = await this.routerRepository.findRouterForHotspot({ routerId, routerUid, identity });
		if (!router) throw new ValidationError("Could not resolve router for this hotspot", HOTSPOT_ERROR_CODES.ROUTER_NOT_RESOLVED);

		const result = await this.hotspotCheckoutFlow.execute({
			userId: user.id, planId, callbackUrl,
			metadata: { macAddress, ipAddress, userAgent, routerId: router.id, routerUid: router.routerUid, routerCode: router.code },
			ip
		});

		return { status: result.status, user: { id: user.id, firstName: user.firstName, email: user.email }, router, account: result.account, plan: result.plan, payment: result.payment, authorizationUrl: result.authorizationUrl };
	}
}
