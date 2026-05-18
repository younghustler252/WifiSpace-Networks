import PaymentModel from "../database/mongoose/payment.model.js";
import { PaymentMapper } from "../mappers/payment.mapper.js";

export class PaymentRepositoryMongo {

    // ---------------- CREATE ----------------
    async create(payment) {
        const doc = await PaymentModel.create(PaymentMapper.toPersistence(payment));
        return PaymentMapper.toDomain(doc);
    }

    // ---------------- UPDATE ----------------
    async update(payment) {
        const updated = await PaymentModel.findByIdAndUpdate(
            payment.id,
            PaymentMapper.toPersistence(payment),
            { runValidators: true, returnDocument: 'after' } // ✅ updated
        );
        return PaymentMapper.toDomain(updated);
    }

    // ---------------- FIND ----------------
    async findById(id) {
        const doc = await PaymentModel.findById(id);
        return PaymentMapper.toDomain(doc);
    }

    async findByGatewayReference(gatewayReference) {
        const doc = await PaymentModel.findOne({ gatewayReference });
        return PaymentMapper.toDomain(doc);
    }

    async findByUser(userId) {
        const docs = await PaymentModel.find({ userId }).sort({ paymentDate: -1 });
        return docs.map(PaymentMapper.toDomain);
    }

    async findByAccount(accountId) {
        const docs = await PaymentModel.find({ accountId }).sort({ paymentDate: -1 });
        return docs.map(PaymentMapper.toDomain);
    }

    async findPayments(filters = {}, { skip = 0, limit = 10 } = {}) {
        const query = {};

        if (filters.userId) query.userId = filters.userId;
        if (filters.accountId) query.accountId = filters.accountId;
        if (filters.planId) query.planId = filters.planId;
        if (filters.status) query.status = filters.status;
        if (filters.paymentChannel) query.paymentChannel = filters.paymentChannel;
        if (filters.renewalStrategy) query.renewalStrategy = filters.renewalStrategy;

        if (filters.startDate || filters.endDate) {
            query.paymentDate = {};
            if (filters.startDate) query.paymentDate.$gte = filters.startDate;
            if (filters.endDate) query.paymentDate.$lte = filters.endDate;
        }

        const docs = await PaymentModel.find(query)
            .sort({ paymentDate: -1 })
            .skip(skip)
            .limit(limit);

        return docs.map(PaymentMapper.toDomain);
    }

    // ---------------- COUNT ----------------
    async countPayments(filters = {}) {
        const query = {};
        if (filters.userId) query.userId = filters.userId;
        if (filters.accountId) query.accountId = filters.accountId;
        if (filters.planId) query.planId = filters.planId;
        if (filters.status) query.status = filters.status;

        if (filters.startDate || filters.endDate) {
            query.paymentDate = {};
            if (filters.startDate) query.paymentDate.$gte = filters.startDate;
            if (filters.endDate) query.paymentDate.$lte = filters.endDate;
        }

        return PaymentModel.countDocuments(query);
    }

    // ---------------- PENDING & AUTO-RENEW ----------------
    async findPendingPayments() {
        const docs = await PaymentModel.find({ status: "pending" }).sort({ paymentDate: 1 });
        return docs.map(PaymentMapper.toDomain);
    }

    async findAutoRenewPaymentsDue() {
        const now = new Date();
        const docs = await PaymentModel.find({
            autoRenewEnabled: true,
            authorizationReusable: true,
            nextBillingDate: { $lte: now },
            status: "successful"
        });
        return docs.map(PaymentMapper.toDomain);
    }

    // ---------------- STATS ----------------
    async countAllPayments() {
        return PaymentModel.countDocuments();
    }

    async countSuccessfulPayments() {
        return PaymentModel.countDocuments({ status: "successful" });
    }
}