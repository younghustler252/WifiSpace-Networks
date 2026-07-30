import { PROFILE_STATUSES } from "../../domain/account.enum.js";

export class ActivateAccount {
	constructor({
		accountRepository,
		subscriptionRepository,
		networkService,
		auditService
	}) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}


	async execute(accountId, context = {}) {

		// ----------------------------
		// Load account
		// ----------------------------
		const account =
			await this.accountRepository.findById(accountId);


		if (!account) {
			throw new Error("Account not found");
		}


		// ----------------------------
		// Validate status
		// ----------------------------
		if (account.isActive()) {
			throw new Error(
				"Account already active"
			);
		}


		if (
			![
				PROFILE_STATUSES.PENDING,
				PROFILE_STATUSES.SUSPENDED
			].includes(account.profileStatus)
		) {
			throw new Error(
				`Cannot activate account with status ${account.profileStatus}`
			);
		}


		// ----------------------------
		// Load subscription
		// ----------------------------
		const subscription =
			await this.subscriptionRepository.findCurrentByAccountId(
				accountId
			);


		if (!subscription) {
			throw new Error(
				"No active subscription found"
			);
		}


		// ----------------------------
		// Provision network access
		// ----------------------------
		const result =
			await this.networkService.activate(
				subscription,
				{
					accountId: account.id
				}
			);


		if (!result.success) {
			throw new Error(
				`Failed to provision account: ${result.error}`
			);
		}


		// ----------------------------
		// Activate profile
		// ----------------------------
		account.activateProfile();


		// ----------------------------
		// Persist account
		// ----------------------------
		await this.accountRepository.update(
			account.id,
			account
		);


		// ----------------------------
		// Audit log
		// ----------------------------
		if (this.auditService) {

			await this.auditService.log({
				actorId: context.actorId || "SYSTEM",
				action: "ACCOUNT_ACTIVATED",
				targetId: account.id,
				resource: "Account",
				metadata: {
					wsnId: account.wsnId,
					serviceType: account.serviceType,
					routerId: account.routerId
				},
				ip: context.ip,
				userAgent: context.userAgent
			});
		}


		return account;
	}
}