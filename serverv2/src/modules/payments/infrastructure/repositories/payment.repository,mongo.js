// modules/payments/infrastructure/repositories/payment.repository.mongo.js
import PaymentModel from "../database/mongoose/payment.model.js";
import { PaymentMapper } from "../mappers/payment.mapper.js";

export class PaymentRepositoryMongo {
	async create(payment) {
		const doc = await PaymentModel.create(PaymentMapper.toPersistence(payment));
		return PaymentMapper.toDomain(doc);
	}

	async findById(id) {
		const doc = await PaymentModel.findById(id);
		return PaymentMapper.toDomain(doc);
	}

	async findByUser(userId) {
		const docs = await PaymentModel.find({ userId }).sort({ paymentDate: -1 });
		return docs.map(PaymentMapper.toDomain);
	}

	async findByAccount({ accountId = null, wsnId = null }) {
		if (!accountId && !wsnId) throw new Error("Either accountId or wsnId is required");
		const query = {};
		if (accountId) query.accountId = accountId;
		if (wsnId) query.wsnId = wsnId;

		const docs = await PaymentModel.find(query).sort({ paymentDate: -1 });
		return docs.map(PaymentMapper.toDomain);
	}

	async findPayments(filters = {}, { skip = 0, limit = 10 } = {}) {
		const query = {};

		if (filters.userId) query.userId = filters.userId;
		if (filters.accountId) query.accountId = filters.accountId;
		if (filters.planId) query.planId = filters.planId;
		if (filters.status) query.status = filters.status;
		if (filters.startDate || filters.endDate) query.paymentDate = {};
		if (filters.startDate) query.paymentDate.$gte = filters.startDate;
		if (filters.endDate) query.paymentDate.$lte = filters.endDate;

		const docs = await PaymentModel.find(query)
			.sort({ paymentDate: -1 })
			.skip(skip)
			.limit(limit);

		return docs.map(PaymentMapper.toDomain);
	}

	async countPayments(filters = {}) {
		const query = {};

		if (filters.userId) query.userId = filters.userId;
		if (filters.accountId) query.accountId = filters.accountId;
		if (filters.planId) query.planId = filters.planId;
		if (filters.status) query.status = filters.status;
		if (filters.startDate || filters.endDate) query.paymentDate = {};
		if (filters.startDate) query.paymentDate.$gte = filters.startDate;
		if (filters.endDate) query.paymentDate.$lte = filters.endDate;

		return PaymentModel.countDocuments(query);
	}

	async findPendingPayments() {
		const docs = await PaymentModel.find({ status: "pending" }).sort({ paymentDate: 1 });
		return docs.map(PaymentMapper.toDomain);
	}

	async updateStatus(id, status) {
		const doc = await PaymentModel.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		);
		return PaymentMapper.toDomain(doc);
	}
}