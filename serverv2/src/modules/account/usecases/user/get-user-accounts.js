import { ACCOUNT_TYPES, PROFILE_STATUSES, SERVICE_TYPES } from "../../domain/account.enum.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetUserAccounts {

	constructor(accountRepository, permissionService) {
		this.accountRepository = accountRepository;
	}

	/**
	 * Fetch accounts for the current user with optional filters
	 * @param {Object} currentUser - logged-in user
	 * @param {Object} filters - optional filters
	 * @param {string} [filters.accountType]
	 * @param {string} [filters.serviceType]
	 * @param {string} [filters.profileStatus]
	 */
	async execute(currentUser, filters = {}) {
		// ----------------------------
		// Validate filters
		// ----------------------------
		const { accountType, serviceType, profileStatus } = filters;

		if (accountType && !ACCOUNT_TYPES.includes(accountType)) {
			throw new ValidationError(`Invalid accountType: ${accountType}`);
		}
		if (serviceType && !SERVICE_TYPES.includes(serviceType)) {
			throw new ValidationError(`Invalid serviceType: ${serviceType}`);
		}
		if (profileStatus && !PROFILE_STATUSES.includes(profileStatus)) {
			throw new ValidationError(`Invalid profileStatus: ${profileStatus}`);
		}

		// ----------------------------
		// Build repository query (user-scoped)
		// ----------------------------
		const query = { userId: currentUser.id }; // only current user's accounts
		if (accountType) query.accountType = accountType;
		if (serviceType) query.serviceType = serviceType;
		if (profileStatus) query.profileStatus = profileStatus;

		// ----------------------------
		// Fetch from repository
		// ----------------------------
		const accounts = await this.accountRepository.findAll(query);

		return accounts;
	}
}