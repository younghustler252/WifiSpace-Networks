import {
	ACCOUNT_TYPE_LIST,
	APPROVAL_STATUS_LIST,
	SERVICE_TYPE_LIST
} from "../../domain/account.enum.js";

import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetAllAccounts {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(params = {}) {
		const {
			accountType,
			serviceType,
			approvalStatus,
			userId,
			routerId,
			search,
			createdAfter,
			createdBefore,
			sort = "wsnid_desc",
			page = 1,
			limit = 20
		} = params;

		if (accountType && !ACCOUNT_TYPE_LIST.includes(accountType)) {
			throw new ValidationError(
				`Invalid accountType: ${accountType}`
			);
		}

		if (serviceType && !SERVICE_TYPE_LIST.includes(serviceType)) {
			throw new ValidationError(
				`Invalid serviceType: ${serviceType}`
			);
		}

		if (approvalStatus && !APPROVAL_STATUS_LIST.includes(approvalStatus)) {
			throw new ValidationError(
				`Invalid approvalStatus: ${approvalStatus}`
			);
		}

		const query = {};

		if (accountType) {
			query.accountType = accountType;
		}

		if (serviceType) {
			query.serviceType = serviceType;
		}

		if (approvalStatus) {
			query.approvalStatus = approvalStatus;
		}

		if (userId) {
			query.userId = userId;
		}

		if (routerId) {
			query.routerId = routerId;
		}

		if (createdAfter || createdBefore) {
			query.createdAt = {};

			if (createdAfter) {
				query.createdAt.$gte = new Date(createdAfter);
			}

			if (createdBefore) {
				query.createdAt.$lte = new Date(createdBefore);
			}
		}

		if (search?.trim()) {
			const term = search.trim();

			query.$or = [
				{
					wsnId: {
						$regex: term,
						$options: "i"
					}
				},
				{
					businessName: {
						$regex: term,
						$options: "i"
					}
				},
				{
					companyRegistrationNumber: {
						$regex: term,
						$options: "i"
					}
				},
				{
					taxId: {
						$regex: term,
						$options: "i"
					}
				},
				{
					routerProfile: {
						$regex: term,
						$options: "i"
					}
				}
			];
		}

		const sortOptions = {
			wsnid_desc: { wsnId: -1 },
			wsnid_asc: { wsnId: 1 },
			newest: { createdAt: -1 },
			oldest: { createdAt: 1 }
		};

		const safeSort =
			sortOptions[sort] ||
			sortOptions.wsnid_desc;

		return this.accountRepository.findAll(
			query,
			safeSort,
			page,
			limit
		);
	}
}
