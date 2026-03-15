import { PERMISSION } from "../../domain/constants/permissions.js";

export class DeleteAccount {
	constructor(accountRepository, permissionService) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
	}

	async execute(currentUser, accountId) {
		const hasPermission = await this.permissionService.hasPermission(
			currentUser.id,
			PERMISSION.ACCOUNT.DELETE
		);

		if (!hasPermission) {
			throw new Error("Unauthorized");
		}

		const account = await this.accountRepository.findById(accountId);

		if (!account) {
			throw new Error("Account not found");
		}

		await this.accountRepository.delete(accountId);

		return {
			success: true,
			message: "Account deleted successfully"
		};
	}
}