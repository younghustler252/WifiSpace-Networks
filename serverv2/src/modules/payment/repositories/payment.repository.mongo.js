import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import PaymentModel from "../database/payment.model.js";
import { PaymentMapper } from "../mappers/payment.mapper.js";
import { PAYMENT_STATUSES } from "../domain/payment.enum.js";


const ACCOUNT_POPULATE = { path: "accountId", select: "wsnId" };
const PLAN_POPULATE = { path: "planId", select: "name price speedRate" };
const USER_POPULATE = { path: "userId", select: "firstName lastName email phone" };

export class PaymentRepositoryMongo extends BaseRepository {
	constructor() {
		super(PaymentModel, PaymentMapper);
	}

	buildQuery(filters = {}) {
		const query = {};
		if (filters.accountId) query.accountId = filters.accountId;
		if (filters.accountIds) query.accountId = { $in: filters.accountIds };
		if (filters.subscriptionId) query.subscriptionId = filters.subscriptionId;
		if (filters.userId) query.userId = filters.userId;
		if (filters.status) query.status = filters.status;
		if (filters.gateway) query.gateway = filters.gateway;
		if (filters.paymentChannel) query.paymentChannel = filters.paymentChannel;
		if (filters.actionType) query.actionType = filters.actionType;
		if (filters.businessProcessed !== undefined) query.businessProcessed = filters.businessProcessed;
		if (filters.startDate || filters.endDate) {
			query.createdAt = {};
			if (filters.startDate) query.createdAt.$gte = filters.startDate;
			if (filters.endDate) query.createdAt.$lte = filters.endDate;
		}
		return query;
	}

	async findById(id) {
		return super.findById(id, { populates: [ACCOUNT_POPULATE, PLAN_POPULATE, USER_POPULATE] });
	}

	async findByGatewayReference(gatewayReference) {
		return this.findOne({ filter: { gatewayReference } });
	}

	async findByIdempotencyKey(idempotencyKey) {
		return this.findOne({ filter: { idempotencyKey } });
	}

	async findByUser(userId) {
		const docs = await this.model.find({ userId }).sort({ paymentDate: -1 }).populate(ACCOUNT_POPULATE).populate(PLAN_POPULATE).populate(USER_POPULATE).lean();
		return this.mapArray(docs);
	}

	async findByAccount(accountId) {
		const docs = await this.model.find({ accountId }).sort({ paymentDate: -1 }).populate(ACCOUNT_POPULATE).populate(PLAN_POPULATE).populate(USER_POPULATE).lean();
		return this.mapArray(docs);
	}

	async paginate(opts = {}) {
		const { filter = {}, ...rest } = opts;
		return super.paginate({ ...rest, filter: this.buildQuery(filter), sort: rest.sort || { paymentDate: -1 }, populates: [ACCOUNT_POPULATE, PLAN_POPULATE, USER_POPULATE] });
	}

	async update(id, entityOrData) {
		const persistence = PaymentMapper.toPersistence(entityOrData);
		await this.model.findByIdAndUpdate(id, persistence, { runValidators: true, new: true });
		return this.findById(id);
	}

	async findExpiredPendingPayments(cutoffDate) {
		const docs = await this.model.find({ status: PAYMENT_STATUSES.PENDING, createdAt: { $lte: cutoffDate } }).lean();
		return this.mapArray(docs);
	}

	async expirePayments(ids) {
		return this.model.updateMany({ _id: { $in: ids } }, { $set: { status: PAYMENT_STATUSES.EXPIRED, failedAt: new Date(), failureReason: "Payment session expired" } });
	}

	async deleteExpiredPayments(cutoffDate) {
		// fixed: original queried `expiredAt`, a field that doesn't exist anywhere in the schema —
		// expirePayments() above sets `failedAt`, so purge on that instead
		return this.model.deleteMany({ status: PAYMENT_STATUSES.EXPIRED, failedAt: { $lte: cutoffDate } });
	}

	async countAllPayments() { return this.count(); }
	async countSuccessfulPayments() { return this.count({ status: PAYMENT_STATUSES.SUCCESSFUL }); }

	// add to payment.repository.mongo.js
	async getRevenueStats() {
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);

		const [result] = await this.model.aggregate([
			{ $match: { status: "successful" } },
			{
				$group: {
					_id: null,
					totalRevenue: { $sum: "$amount.total" },
					revenueThisMonth: { $sum: { $cond: [{ $gte: ["$processedAt", startOfMonth] }, "$amount.total", 0] } }
				}
			}
		]);

		return result || { totalRevenue: 0, revenueThisMonth: 0 };
	}
}
