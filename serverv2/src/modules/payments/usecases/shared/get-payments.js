import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetPaymentsUseCase {
	constructor({ paymentRepository, accountRepository }) {
		this.paymentRepository = paymentRepository;
		this.accountRepository = accountRepository;
	}

	async execute({
		userRole,
		authenticatedUserId,
		accountId,
		filters = {},
		pagination = {},
		sort = {}
	}) {
		const { page = 1, limit = 10 } = pagination;
		const skip = (page - 1) * limit;

		const query = {};

		// =================================================
		// CUSTOMER SCOPE (STRICT ACCOUNT OWNERSHIP)
		// =================================================
		if (userRole === "customer") {
			if (!accountId) {
				throw new ValidationError(
					"Account ID is required"
				);
			}

			const account =
				await this.accountRepository.findById(
					accountId
				);

			if (!account) {
				throw new ValidationError(
					"Account not found"
				);
			}

			// ownership check
			if (
				account.userId.toString() !==
				authenticatedUserId.toString()
			) {
				throw new ValidationError(
					"Unauthorized account access"
				);
			}

			// force scope to this account only
			query.accountId = accountId;
		}

		// =================================================
		// ADMIN SCOPE (FULL ACCESS)
		// =================================================
		if (userRole === "admin") {
			if (filters.accountId) {
				query.accountId = filters.accountId;
			}

			if (filters.userId) {
				query.userId = filters.userId;
			}
		}

		// =================================================
		// COMMON FILTERS (SAFE FOR ALL ROLES)
		// =================================================
		if (filters.planId) {
			query.planId = filters.planId;
		}

		if (filters.status) {
			query.status = filters.status;
		}

		// =================================================
		// DATE FILTER
		// =================================================
		if (filters.fromDate || filters.toDate) {
			query.paymentDate = {};

			if (filters.fromDate) {
				query.paymentDate.$gte = new Date(
					filters.fromDate
				);
			}

			if (filters.toDate) {
				query.paymentDate.$lte = new Date(
					filters.toDate
				);
			}
		}

		// =================================================
		// SORTING
		// =================================================
		const sortOption = {};

		if (sort.field) {
			sortOption[sort.field] =
				sort.order === "asc" ? 1 : -1;
		} else {
			sortOption.paymentDate = -1;
		}

		// =================================================
		// FETCH DATA
		// =================================================
		const payments =
			await this.paymentRepository.findPayments(
				query,
				{
					skip,
					limit,
					sort: sortOption
				}
			);

		// =================================================
		// ENRICH DATA (accounts)
		// =================================================
		const enriched = await Promise.all(
			payments.map(async (payment) => {
				const account =
					await this.accountRepository.findById(
						payment.accountId
					);

				return {
					...payment,
					account: account
						? {
								_id: account._id,
								wsnId: account.wsnId
						  }
						: null
				};
			})
		);

		// =================================================
		// TOTAL COUNT
		// =================================================
		const total =
			await this.paymentRepository.countPayments(
				query
			);

		return {
			data: enriched,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(
					total / limit
				)
			}
		};
	}
}