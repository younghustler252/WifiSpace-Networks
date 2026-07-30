import { ValidationError } from "../../../shared/errors/validation-error.js";

export class StartHotspotPurchase {
	constructor({
		userRepository,
		registerHotspotUser,
		routerRepository,
		hotspotCheckoutFlow,
		hotspotSessionRepository // NEW — needed to recognize an already-trusted device
	}) {
		this.userRepository = userRepository;
		this.registerHotspotUser = registerHotspotUser;
		this.routerRepository = routerRepository;
		this.hotspotCheckoutFlow = hotspotCheckoutFlow;
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({
		firstName,
		lastName,
		email,
		phone,
		planId,
		routerId,
		routerUid,
		identity,
		macAddress,
		ipAddress,
		userAgent
	}) {
		if (!email) {
			throw new ValidationError("email is required");
		}

		let user = await this.userRepository.findByEmail(email);

		if (user) {
			// NEW: this device may have already proven who it is via
			// AuthenticateHotspotSession — check for a matching, authenticated
			// session tied to THIS specific user before demanding a login the
			// device already passed. Matching on both status and userId
			// matters: a device trusted for a *different* account submitting
			// someone else's email should still be bounced to login.
			const trustedSession = macAddress
				? await this.hotspotSessionRepository.findByMac(macAddress)
				: null;

			const isTrustedForThisUser =
				trustedSession &&
				trustedSession.status === "authenticated" &&
				String(trustedSession.userId) === String(user.id);

			if (!isTrustedForThisUser) {
				return {
					status: "EXISTING_USER",
					requiresLogin: true,
					message: "Welcome back. Please login to continue.",
					user: {
						id: user.id,
						firstName: user.firstName,
						email: user.email
					}
				};
			}
			// Trusted — fall through to the same checkout path as a new user,
			// just skipping registerHotspotUser since the account already exists.
		} else {
			user = await this.registerHotspotUser.execute({
				firstName,
				lastName,
				email,
				phone
			});
		}

		const router = await this.routerRepository.findRouterForHotspot({
			routerId,
			routerUid,
			identity
		});

		if (!router) {
			throw new Error("No available hotspot router found");
		}

		const result = await this.hotspotCheckoutFlow.execute({
			userId: user.id,
			planId,
			metadata: {
				macAddress,
				ipAddress,
				userAgent,
				routerId: router.id,
				routerUid: router.routerUid,
				routerCode: router.code,
				routerStatus: router.status
			}
		});

		return {
			status: result.status,
			user: result.user,
			router,
			account: result.account,
			plan: result.plan,
			payment: result.payment
		};
	}
}