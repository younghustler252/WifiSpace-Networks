import { ValidationError, UnauthorizedError, NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";

export class StartHotspot {
	constructor({ userRepository, registerHotspotUser, routerRepository, hotspotCheckoutFlow, hotspotSessionRepository, payWithWallet, passwordService, accountRepository, planRepository }) {
		this.payWithWallet = payWithWallet;
		this.passwordService = passwordService;
		this.accountRepository = accountRepository;
		this.planRepository = planRepository;
		this.userRepository = userRepository;
		this.registerHotspotUser = registerHotspotUser;
		this.routerRepository = routerRepository;
		this.hotspotCheckoutFlow = hotspotCheckoutFlow;
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ firstName, lastName, email, phone, planId, callbackUrl, payWith = "gateway", password, routerId, routerUid, routerCode, identity, macAddress, ipAddress, userAgent, ip = null }) {
		if (!email) throw new ValidationError("Email is required");
		if (!macAddress) throw new ValidationError("Device MAC address is required");
		if (payWith !== "wallet" && !callbackUrl) throw new ValidationError("callbackUrl is required");

		if (payWith === "wallet") {
			return this._payFromWallet({ email, password, planId, routerId, routerUid, routerCode, identity, macAddress, ipAddress, userAgent, ip });
		}

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

		const router = await this.routerRepository.findRouterForHotspot({ routerId, routerUid, routerCode, identity });
		if (!router) throw new ValidationError("Could not resolve router for this hotspot", HOTSPOT_ERROR_CODES.ROUTER_NOT_RESOLVED);

		const result = await this.hotspotCheckoutFlow.execute({
			userId: user.id, planId, callbackUrl,
			metadata: { macAddress, ipAddress, userAgent, routerId: router.id, routerUid: router.routerUid, routerCode: router.code },
			ip
		});

		return { status: result.status, user: { id: user.id, firstName: user.firstName, email: user.email }, router, account: result.account, plan: result.plan, payment: result.payment, authorizationUrl: result.authorizationUrl };
	}

	async _payFromWallet({ email, password, planId, routerId, routerUid, routerCode, identity, macAddress, ipAddress, userAgent, ip }) {
		const user = await this.userRepository.findAuthByEmail(email);
		const valid = user ? await this.passwordService.compare(password, user.hashedPassword) : false;
		if (!valid) throw new UnauthorizedError("Invalid credentials", HOTSPOT_ERROR_CODES.INVALID_CREDENTIALS);

		const account = await this.accountRepository.findOne({ userId: user.id, serviceType: "hotspot" });
		if (!account) throw new NotFoundError("Hotspot account not found", HOTSPOT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan || plan.serviceType !== "hotspot") throw new ValidationError("Plan is not a hotspot plan");

		const router = await this.routerRepository.findRouterForHotspot({ routerId, routerUid, routerCode, identity });
		if (!router) throw new ValidationError("Could not resolve router for this hotspot", HOTSPOT_ERROR_CODES.ROUTER_NOT_RESOLVED);

		const paid = await this.payWithWallet.execute({
			userId: user.id, accountId: account.id, planId,
			provisioningMetadata: { macAddress, ipAddress, userAgent, routerId: router.id, routerUid: router.routerUid, routerCode: router.code },
			ip
		});

		return {
			status: "PAID",
			user: { id: user.id, firstName: user.firstName, email: user.email },
			router, account, plan,
			payment: paid.payment,
			reference: paid.payment.gatewayReference,
			provisioning: paid.outcome?.provisioning ?? null,
			balance: paid.balance
		};
	}
}
