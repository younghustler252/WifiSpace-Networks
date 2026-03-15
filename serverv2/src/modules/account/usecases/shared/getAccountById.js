import { PERMISSION } from "../../domain/constants/permissions.js";

export class GetAccountById {
	constructor(accountRepository, permissionService) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
	}

	async execute(currentUser, accountId) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new Error("Account not found");

		// Role/permission check
		const canAccess =
			(await this.permissionService.hasPermission(currentUser.id, PERMISSION.ACCOUNT.VIEW)) ||
			account.userId === currentUser.id; // Self can view own account

		if (!canAccess) throw new Error("Unauthorized");

		return account;
	}
}