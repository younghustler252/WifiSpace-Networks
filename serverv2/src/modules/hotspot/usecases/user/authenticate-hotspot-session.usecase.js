// hotspot/usecases/authenticate-hotspot-session.usecase.js — updated
import { ValidationError, UnauthorizedError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class AuthenticateHotspotSession {
	constructor({ userRepository, ensureHotspotAccount, routerRepository, subscriptionRepository, networkService, passwordService, hotspotSessionRepository }) {
		this.userRepository = userRepository;
		this.ensureHotspotAccount = ensureHotspotAccount;
		this.routerRepository = routerRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.passwordService = passwordService;
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ email, password, macAddress, ipAddress, userAgent, routerId, routerUid, routerCode, identity }) {
		if (!email || !password) throw new ValidationError("Email and password are required");
		if (!macAddress) throw new ValidationError("Device MAC address is required");

		const user = await this.userRepository.findAuthByEmail(email);
		if (!user) throw new UnauthorizedError("Invalid credentials", HOTSPOT_ERROR_CODES.INVALID_CREDENTIALS);

		const valid = await this.passwordService.compare(password, user.hashedPassword);
		if (!valid) throw new UnauthorizedError("Invalid credentials", HOTSPOT_ERROR_CODES.INVALID_CREDENTIALS);

		const account = await this.ensureHotspotAccount.execute({ userId: user.id });

		const router = await this.routerRepository.findRouterForHotspot({ routerId, routerUid, routerCode, identity });
		if (!router) throw new ValidationError("Could not resolve router for this hotspot", HOTSPOT_ERROR_CODES.ROUTER_NOT_RESOLVED);

		const session = await this.hotspotSessionRepository.upsertByMac(macAddress, {
			macAddress, routerId: router.id, userId: user.id, accountId: account.id,
			ipAddress, userAgent, status: "authenticated", trustedDevice: true,
			lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_MS)
		});

		// NEW: if this account already has an active subscription (e.g. an
		// admin recorded a phone-support payment before this device ever
		// touched a router), provision it right now — the login IS the
		// first moment we know which router to talk to.
		let provisionResult = null;
		const subscription = await this.subscriptionRepository.findCurrentByAccountId(account.id);
		if (subscription?.isActive()) {
			provisionResult = await this.networkService.activate(subscription, { routerId: router.id, ipAddress });
		}

		return { session, user, account, router, subscription, provisionResult };
	}
}