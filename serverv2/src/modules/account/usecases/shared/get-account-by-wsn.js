import { PERMISSION } from "../../domain/constants/permissions.js";

export class GetAccountByWsnId {
	constructor(accountRepository, permissionService) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
	}

	async execute(currentUser, wsnId) {
		const account = await this.accountRepository.findByWsnId(wsnId);
		if (!account) throw new Error("Account not found");

		// Role/permission check
		const canAccess =
			(await this.permissionService.hasPermission(currentUser.id, PERMISSION.ACCOUNT.VIEW)) ||
			account.userId === currentUser.id; // Self can view own account

		if (!canAccess) throw new Error("Unauthorized");

		return account;
	}
}