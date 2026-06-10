export class GetPaymentsUseCase {
	constructor({
		paymentRepository,
		accountRepository,
	}) {
		this.paymentRepository =
			paymentRepository;

		this.accountRepository =
			accountRepository;
	}

	async execute(
		currentUser,
		params = {}
	) {
		if (!currentUser) {
			throw new Error(
				"Unauthorized"
			);
		}

		const {
			search,

			accountId,

			status,
			gateway,
			paymentChannel,
			actionType,

			businessProcessed,
			isWebhookProcessed,

			createdAfter,
			createdBefore,

			sort = "newest",

			skip = 0,
			limit = 50,
		} = params;

		// =========================================
		// ROLE-BASED ACCOUNT SCOPE
		// =========================================

		let accountScope = null;

		if (
			currentUser.role ===
				"customer" ||
			currentUser.role ===
				"staff"
		) {
			const accounts =
				await this.accountRepository.findByUserId(
					currentUser.id
				);

			accountScope =
				accounts.map(
					(acc) => acc.id
				);
		}

		// =========================================
		// BUILD QUERY
		// =========================================

		const query = {};

		// Restrict customers/staff
		if (accountScope) {
			query.accountId = {
				$in: accountScope,
			};
		}

		// Admin account filter
		if (accountId) {
			if (
				accountScope &&
				!accountScope.includes(
					accountId
				)
			) {
				throw new Error(
					"Forbidden account access"
				);
			}

			query.accountId =
				accountId;
		}

		// =========================================
		// SEARCH
		// =========================================

		if (search?.trim()) {
			query.$or = [
				{
					gatewayReference:
						{
							$regex:
								search.trim(),
							$options:
								"i",
						},
				},
				{
					idempotencyKey:
						{
							$regex:
								search.trim(),
							$options:
								"i",
						},
				},
			];
		}

		// =========================================
		// FILTERS
		// =========================================

		if (status)
			query.status = status;

		if (gateway)
			query.gateway =
				gateway;

		if (paymentChannel)
			query.paymentChannel =
				paymentChannel;

		if (actionType)
			query.actionType =
				actionType;

		if (
			businessProcessed !==
			undefined
		) {
			query.businessProcessed =
				businessProcessed;
		}

		if (
			isWebhookProcessed !==
			undefined
		) {
			query.isWebhookProcessed =
				isWebhookProcessed;
		}

		// =========================================
		// DATE RANGE
		// =========================================

		if (
			createdAfter ||
			createdBefore
		) {
			query.createdAt = {};

			if (createdAfter) {
				query.createdAt.$gte =
					new Date(
						createdAfter
					);
			}

			if (createdBefore) {
				const endDate =
					new Date(
						createdBefore
					);

				endDate.setHours(
					23,
					59,
					59,
					999
				);

				query.createdAt.$lte =
					endDate;
			}
		}

		// =========================================
		// SORTING
		// =========================================

		const sortOptions = {
			newest: {
				createdAt: -1,
			},

			oldest: {
				createdAt: 1,
			},

			amount_desc: {
				"amount.total":
					-1,
			},

			amount_asc: {
				"amount.total":
					1,
			},
		};

		const safeSort =
			sortOptions[sort] ||
			sortOptions.newest;

		// =========================================
		// PAGINATION
		// =========================================

		const safeLimit =
			Math.min(
				Number(limit) ||
					50,
				100
			);

		const safeSkip =
			Math.max(
				Number(skip) || 0,
				0
			);

		// =========================================
		// FETCH
		// =========================================

		const [
			payments,
			total,
		] = await Promise.all([
			this.paymentRepository.findPayments(
				query,
				{
					skip: safeSkip,
					limit: safeLimit,
					sort: safeSort,
				}
			),

			this.paymentRepository.countPayments(
				query
			),
		]);

		// =========================================
		// RETURN
		// =========================================

		return {
			data: payments,

			pagination: {
				total,

				skip: safeSkip,

				limit: safeLimit,

				totalPages:
					Math.max(
						1,
						Math.ceil(
							total /
								safeLimit
						)
					),
			},
		};
	}
}