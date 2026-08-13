import { APPROVAL_STATUSES } from "../../domain/account.enum.js";

export class ApproveAccount {

	constructor({
		accountRepository,
		subscriptionRepository,
		networkService
	}) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
	}

	async execute(accountId, approvedBy) {
		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new Error("Account not found");
		}

		if (account.isApproved()) {
			throw new Error("Account already approved");
		}

		if (
			account.approvalStatus !== APPROVAL_STATUSES.PENDING &&
			account.approvalStatus !== APPROVAL_STATUSES.REJECTED
		) {
			throw new Error(
				`Cannot approve account with status ${account.approvalStatus}`
			);
		}

		const subscription =
			await this.subscriptionRepository.findCurrentByAccountId(
				accountId
			);

		if (!subscription) {
			throw new Error("No active subscription found");
		}

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

		account.approve(approvedBy);

		await this.accountRepository.update(
			account.id,
			account
		);

		return account;
	}
}