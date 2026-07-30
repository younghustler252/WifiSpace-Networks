import { ValidationError } from "../../../shared/errors/validation-error.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { HotspotSession } from "../domain/hotspot-session.entity.js";

export class AuthenticateHotspotSession {
	constructor({
		userRepository,
		accountRepository,
		routerRepository, // NEW — needed to resolve identity -> actual router
		passwordService,
		hotspotSessionRepository
	}) {
		this.userRepository = userRepository;
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.passwordService = passwordService;
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({
		email,
		password,
		macAddress,
		ipAddress,
		userAgent,
		routerId,   // may not actually be a valid Mongo id — see below
		routerUid,  // NEW
		identity    // NEW — this is what the MikroTik redirect actually sends
	}) {
		if (!email || !password) {
			throw new ValidationError("Email and password are required");
		}

		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new UnauthorizedError("Invalid credentials");
		}

		const valid = await this.passwordService.compare(password, user.hashedPassword);
		if (!valid) {
			throw new UnauthorizedError("Invalid credentials");
		}

		const account = await this.accountRepository.findOne({
			userId: user.id,
			serviceType: "hotspot"
		});
		if (!account) {
			throw new ValidationError("No hotspot account found");
		}

		
		const router = await this.routerRepository.findRouterForHotspot({
			routerId,
			routerUid,
			identity
		});
		if (!router) {
			throw new ValidationError("Could not resolve router for this hotspot");
		}

		let session = await this.hotspotSessionRepository.findByMac(macAddress);

		if (!session) {
			session = await this.hotspotSessionRepository.create(
				new HotspotSession({
					userId: user.id,
					accountId: account.id,
					routerId: router.id, // CHANGED: was raw routerId param
					macAddress,
					ipAddress,
					userAgent,
					status: "authenticated",
					trustedDevice: true,
					lastSeenAt: new Date()
					// NOTE: expiresAt still not set here — see earlier flag,
					// TTL index does nothing until this is populated.
				})
			);
		} else {
			session.status = "authenticated";
			session.userId = user.id;
			session.accountId = account.id;
			session.routerId = router.id; // CHANGED
			session.ipAddress = ipAddress;
			session.userAgent = userAgent;
			session.trustedDevice = true;
			session.lastSeenAt = new Date();

			session = await this.hotspotSessionRepository.update(session.id, session);
		}

		return session;
	}
}