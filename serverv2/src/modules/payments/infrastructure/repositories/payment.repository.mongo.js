import PaymentModel from "../database/mongoose/payment.model.js";

import {
	PaymentMapper
} from "../mappers/payment.mapper.js";

export class PaymentRepositoryMongo {

	// =================================
	// QUERY BUILDER
	// =================================

	buildQuery(filters = {}) {
		const query = {};

		// PRIMARY OWNERSHIP
		if (filters.accountId) {
			query.accountId = filters.accountId;
		}

		// OPTIONAL (admin use only)
		if (filters.accountIds) {
			query.accountId = { $in: filters.accountIds };
		}

		// BUSINESS FILTERS
		if (filters.status) query.status = filters.status;
		if (filters.gateway) query.gateway = filters.gateway;
		if (filters.paymentChannel) query.paymentChannel = filters.paymentChannel;
		if (filters.actionType) query.actionType = filters.actionType;

		// BUSINESS FLAGS
		if (filters.businessProcessed !== undefined)
			query.businessProcessed = filters.businessProcessed;

		if (filters.isWebhookProcessed !== undefined)
			query.isWebhookProcessed = filters.isWebhookProcessed;

		// DATE RANGE (pick ONE standard field — choose createdAt OR paymentDate)
		if (filters.startDate || filters.endDate) {
			query.createdAt = {};
			if (filters.startDate) query.createdAt.$gte = filters.startDate;
			if (filters.endDate) query.createdAt.$lte = filters.endDate;
		}

		return query;
	}

	// =================================
	// CREATE
	// =================================

	async create(payment) {

		const doc =
			await PaymentModel.create(
				PaymentMapper.toPersistence(
					payment
				)
			);

		return PaymentMapper.toDomain(doc);
	}

	// =================================
	// UPDATE
	// =================================

	async update(payment) {

		const updated =
			await PaymentModel.findByIdAndUpdate(
				payment.id,

				PaymentMapper.toPersistence(
					payment
				),

				{
					runValidators: true,
					new: true
				}
			)
				.populate(
					"accountId",
					"wsnId"
				)
				.populate(
					"planId",
					"name price speedRate"
				);

		return PaymentMapper.toDomain(
			updated
		);
	}

	// =================================
	// FIND BY ID
	// =================================

	async findById(id) {

		const doc =
			await PaymentModel.findById(id)
				.populate(
					"accountId",
					"wsnId"
				)
				.populate(
					"planId",
					"name price speedRate"
				);

		return PaymentMapper.toDomain(
			doc
		);
	}

	// =================================
	// FIND BY REFERENCE
	// =================================

	async findByGatewayReference(
		gatewayReference
	) {

		const doc =
			await PaymentModel.findOne({
				gatewayReference
			});

		return PaymentMapper.toDomain(
			doc
		);
	}

	// =================================
	// FIND BY USER
	// =================================

	async findByUser(userId) {

		const docs =
			await PaymentModel.find({
				userId
			})
				.sort({
					paymentDate: -1
				})
				.populate(
					"accountId",
					"wsnId"
				)
				.populate(
					"planId",
					"name price speedRate"
				);

		return docs.map(
			PaymentMapper.toDomain
		);
	}

	// =================================
	// FIND BY ACCOUNT
	// =================================

	async findByAccount(accountId) {

		const docs =
			await PaymentModel.find({
				accountId
			})
				.sort({
					paymentDate: -1
				})
				.populate(
					"accountId",
					"wsnId"
				)
				.populate(
					"planId",
					"name price speedRate"
				);

		return docs.map(
			PaymentMapper.toDomain
		);
	}

	// =================================
	// FIND PAYMENTS
	// =================================

	async findPayments(
		filters = {},
		{
			skip = 0,
			limit = 10,
			sort = {
				paymentDate: -1
			}
		} = {}
	) {

		const query =
			this.buildQuery(filters);

		const docs =
			await PaymentModel.find(query)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.populate(
					"accountId",
					"wsnId"
				)
				.populate(
					"planId",
					"name price speedRate"
				);

		return docs.map(
			PaymentMapper.toDomain
		);
	}

	// =================================
	// COUNT
	// =================================

	async countPayments(
		filters = {}
	) {

		const query =
			this.buildQuery(filters);

		return PaymentModel.countDocuments(
			query
		);
	}

	// =================================
	// PENDING
	// =================================

	async findExpiredPendingPayments(cutoffDate) {
		const docs = await PaymentModel.find({
			status: "pending",
			createdAt: {
				$lte: cutoffDate
			}
		});

		return docs.map(PaymentMapper.toDomain);
	}

	async expirePayments(ids) {
		return PaymentModel.updateMany(
			{
				_id: { $in: ids }
			},
			{
				$set: {
					status: "expired",
					failedAt: new Date(),
					failureReason: "Payment session expired"
				}
			}
		);
	}
	// =================================
	// AUTO RENEW
	// =================================

	async findAutoRenewPaymentsDue() {

		const now = new Date();

		const docs =
			await PaymentModel.find({
				"metadata.autoRenewEnabled": true,

				"metadata.authorizationReusable": true,

				status: "successful",

				nextBillingDate: {
					$lte: now
				}
			});

		return docs.map(
			PaymentMapper.toDomain
		);
	}

	// =================================
	// STATS
	// =================================

	async countAllPayments() {
		return PaymentModel.countDocuments();
	}

	async countSuccessfulPayments() {

		return PaymentModel.countDocuments({
			status: "successful"
		});
	}
}