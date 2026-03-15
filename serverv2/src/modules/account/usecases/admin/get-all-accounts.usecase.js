import { ACCOUNT_TYPES, PROFILE_STATUSES, SERVICE_TYPES } from "../../domain/account.enum.js";
import PERMISSION from "../../../../shared/constants/permissions.js";

import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetAllAccounts {

	constructor(accountRepository, permissionService, auditService) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	/**
	 * Fetch all accounts with optional filters
	 * @param {Object} currentUser - the admin/staff performing the action
	 * @param {Object} filters - optional filters
	 * @param {string} [filters.accountType] - personal/business
	 * @param {string} [filters.serviceType] - pppoe/hotspot
	 * @param {string} [filters.profileStatus] - pending/active/suspended/canceled
	 * @param {string} [filters.userId] - specific user
	 * @param {Date} [filters.createdAfter]
	 * @param {Date} [filters.createdBefore]
	 * @param {Object} context - { ip, userAgent } for audit logging
	 */
	async execute(currentUser, filters = {}, context = {}) {

		// ----------------------------
		// Permission Check
		// ----------------------------
		await this.permissionService.hasPermission(
			currentUser.id,
			PERMISSION.ACCOUNT.VIEW
		);

		// ----------------------------
		// Validate filters
		// ----------------------------
		const { accountType, serviceType, profileStatus, userId, createdAfter, createdBefore } = filters;

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
		// Build repository query
		// ----------------------------
		const query = {};

		if (accountType) query.accountType = accountType;
		if (serviceType) query.serviceType = serviceType;
		if (profileStatus) query.profileStatus = profileStatus;
		if (userId) query.userId = userId;
		if (createdAfter || createdBefore) query.createdAt = {};
		if (createdAfter) query.createdAt.$gte = createdAfter;
		if (createdBefore) query.createdAt.$lte = createdBefore;

		// ----------------------------
		// Fetch from repository
		// ----------------------------
		const accounts = await this.accountRepository.findAll(query);

		// ----------------------------
		// Audit Log
		// ----------------------------
		await this.auditService.log({
			actorId: currentUser.id,
			action: "ACCOUNT_LIST_VIEWED",
			targetId: null,
			resource: "Account",
			metadata: {
				filters,
				resultCount: accounts.length
			},
			ip: context.ip,
			userAgent: context.userAgent
		});

		return accounts;
	}
}