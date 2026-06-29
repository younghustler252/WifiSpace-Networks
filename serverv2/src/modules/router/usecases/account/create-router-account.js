import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreateRouterAccount {
	constructor({
		accountRepository,
		userRepository,
		routerRepository,
		mikrotikService,
		auditService,
	}) {
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.routerRepository = routerRepository;
		this.mikrotikService = mikrotikService;
		this.auditService = auditService;
	}

	async execute(accountId, context = {}) {
		const account = await this.accountRepository.findById(accountId);

		if (!account)
			throw new ValidationError("Account not found");

		if (!account.routerId)
			throw new ValidationError("No router assigned to account");

		// ----------------------------
		// OPTIMIZED PASSWORD LOOKUP (CHECK CONTEXT / EXISTING / FALLBACK)
		// ----------------------------
		let routerPassword = context.routerPassword || account.routerPassword;

		if (!routerPassword) {
			console.log(`[CreateRouterAccount] Password missing. Fetching user record...`);
			
			try {
				const user = await this.userRepository.findById(account.userId.toString());
				const userPhone = user?.phone;

				if (account.serviceType === "hotspot") {
					routerPassword = userPhone || "Access123";
				} else {
					routerPassword = userPhone || "C0NN3CT@pppoe123$";
				}
			} catch (dbErr) {
				console.error("User lookup failed in router provisioning:", dbErr.message);
				routerPassword = account.serviceType === "hotspot" ? "Access123" : "C0NN3CT@pppoe123$";
			}
		}

		// Ensure consistency in memory
		account.routerPassword = routerPassword;

		const router = await this.routerRepository.findById(account.routerId);

		if (!router)
			throw new ValidationError("Router not found");

		if (!router.apiEnabled || !router.isEnabled) {
			throw new ValidationError("Router API is disabled");
		}

		try {
			// Prevent duplicate provisioning
			const exists = await this.mikrotikService.checkUserExists(
				account,
				router
			);

			if (!exists) {
				await this.mikrotikService.createAccount(
					account,
					router,
					routerPassword
				);
			}

			account.routerProvision = account.routerProvision || {};
			account.routerProvision.status = "synced";
			account.routerProvision.lastError = null;
			account.routerProvision.lastAttemptAt = new Date();

			// Persist the updated state and password string
			const updatedAccount = await this.accountRepository.update(
				account.id,
				account
			);

			await this.routerRepository.incrementSessions(router.id);

			return {
				success: true,
				code: "ROUTER_PROVISIONED",
				message: "Account successfully provisioned on router",
				data: updatedAccount,
			};

		} catch (error) {
			account.routerProvision = account.routerProvision || {};
			account.routerProvision.status = "failed";
			account.routerProvision.lastError = error.message;
			account.routerProvision.lastAttemptAt = new Date();

			await this.accountRepository.update(
				account.id,
				account
			);

			throw new Error(`Provisioning failed: ${error.message}`);
		}
	}
}
