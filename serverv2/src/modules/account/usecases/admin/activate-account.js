import {PERMISSION } from "../../../../shared/constants/permissions.js";
import { PROFILE_STATUSES } from "../../domain/account.enum.js";

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ActivateAccount {

	constructor(accountRepository, permissionService) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
	}

	async execute(currentUser, accountId) {

		await this.permissionService.hasPermission(
			currentUser.id,
			PERMISSION.ACCOUNT.ACTIVATE
		);

		const account = await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError("Account not found");
		}

		if (account.profileStatus === PROFILE_STATUSES.ACTIVE) {
			throw new ValidationError("Account already active");
		}

		account.activateProfile();

		return this.accountRepository.update(account.id, account);
	}
}