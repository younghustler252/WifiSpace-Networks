import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreateRouterAccount {
	constructor({
		accountRepository,
		routerRepository,
		mikrotikService,
		auditService,
	}) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.mikrotikService = mikrotikService;
		this.auditService = auditService;
	}

	async execute(accountId, context = {}) {

		const account =
			await this.accountRepository.findById(accountId);

		if (!account)
			throw new ValidationError("Account not found");

		if (!account.routerId)
			throw new ValidationError("No router assigned to account");

		// ----------------------------
		// SAFE PASSWORD FALLBACK
		// ----------------------------
		const routerPassword =
			account.routerPassword || "C0NN3CT@pppoe123$";

		// IMPORTANT: ensure consistency in memory
		account.routerPassword = routerPassword;

		const router =
			await this.routerRepository.findById(account.routerId);

		if (!router)
			throw new ValidationError("Router not found");

		if (!router.apiEnabled || !router.isEnabled) {
			throw new ValidationError("Router API is disabled");
		}

		try {
			// prevent duplicate provisioning
			const exists =
				await this.mikrotikService.checkUserExists(
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

			account.routerProvision =
				account.routerProvision || {};

			account.routerProvision.status = "synced";
			account.routerProvision.lastError = null;
			account.routerProvision.lastAttemptAt =
				new Date();

			const updatedAccount =
				await this.accountRepository.update(
					account.id,
					account
				);

			await this.routerRepository.incrementSessions(
				router.id
			);

			// if (this.auditService) {
			// 	await this.auditService.log({
			// 		actorId: context.actorId,
			// 		action: "ROUTER_PROVISIONED",
			// 		targetId: updatedAccount.id,
			// 		resource: "Account",
			// 		metadata: {
			// 			wsnId: updatedAccount.wsnId,
			// 			routerCode: router.code,
			// 		},
			// 	});
			// }

			return {
				success: true,
				code: "ROUTER_PROVISIONED",
				message:
					"Account successfully provisioned on router",
				data: updatedAccount,
			};

		} catch (error) {

			account.routerProvision =
				account.routerProvision || {};

			account.routerProvision.status = "failed";
			account.routerProvision.lastError =
				error.message;

			account.routerProvision.lastAttemptAt =
				new Date();

			await this.accountRepository.update(
				account.id,
				account
			);

			throw new Error(
				`Provisioning failed: ${error.message}`
			);
		}
	}
}