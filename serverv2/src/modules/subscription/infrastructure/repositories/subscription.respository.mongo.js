import SubscriptionModel from "../database/mongoose/subscription.model.js";
import { SubscriptionRepository } from "../../domain/subscripton.repository.js";
import { SubscriptionMapper } from "../mappers/subscription.mapper.js";

export class SubscriptionRepositoryMongo extends SubscriptionRepository {

	// -----------------------------
	// CREATE
	// -----------------------------
	async create(subscription) {
		const data = SubscriptionMapper.toPersistence(subscription);
		const doc = await SubscriptionModel.create(data);
		return SubscriptionMapper.toDomain(doc);
	}

	// -----------------------------
	// SAVE (domain-driven updates)
	// -----------------------------
	async save(subscription) {
		const data = SubscriptionMapper.toPersistence(subscription);

		const doc = await SubscriptionModel.findByIdAndUpdate(
			subscription.id,
			data,
			{ new: true }
		);

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	// -----------------------------
	// FIND BY ID
	// -----------------------------
	async findById(id) {
		const doc = await SubscriptionModel
			.findById(id)
			.populate("planId")
			.populate("accountId");

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	// -----------------------------
	// FIND BY ACCOUNT
	// -----------------------------
	async findByAccountId(accountId) {
		const docs = await SubscriptionModel
			.find({ accountId })
			.populate("planId");

		return docs.map(doc =>
			SubscriptionMapper.toDomain(doc)
		);
	}

	// -----------------------------
	// ACTIVE SUBSCRIPTION
	// -----------------------------
	async findActiveByAccount(accountId) {
		const doc = await SubscriptionModel
			.findOne({
				accountId,
				status: "active",
				endDate: { $gt: new Date() }
			})
			.populate("planId");

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	// -----------------------------
	// 🔥 NEW: SUSPENDED SUBSCRIPTION (REQUIRED FOR RESUME)
	// -----------------------------
	async findSuspendedByAccount(accountId) {
		const doc = await SubscriptionModel
			.findOne({
				accountId,
				status: "suspended"
			})
			.populate("planId");

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	// -----------------------------
	// 🔥 NEW: LATEST SUBSCRIPTION (used in renew fallback)
	// -----------------------------
	async findLatestByAccount(accountId) {
		const doc = await SubscriptionModel
			.findOne({ accountId })
			.sort({ createdAt: -1 })
			.populate("planId");

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	// -----------------------------
	// 🔥 CRON JOB QUERY (EXPIRATION CANDIDATES)
	// -----------------------------
	async findExpiredCandidates(now) {
		const docs = await SubscriptionModel.find({
			status: "active",
			endDate: { $lte: now }
		});

		return docs.map(doc =>
			SubscriptionMapper.toDomain(doc)
		);
	}

	// -----------------------------
	// GENERIC UPDATE (admin/system only)
	// -----------------------------
	async update(id, updateData) {
		const doc = await SubscriptionModel.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	// -----------------------------
	// STATUS UPDATE (legacy helper)
	// -----------------------------
	async updateStatus(id, status) {
		const doc = await SubscriptionModel.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		);

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	// -----------------------------
	// LISTING (ADMIN PANEL)
	// -----------------------------
	async findMany({
		filter = {},
		limit = 20,
		skip = 0,
		sort = { createdAt: -1 }
	} = {}) {

		const docs = await SubscriptionModel
			.find(filter)
			.sort(sort)
			.skip(skip)
			.limit(limit)
			.populate("planId")
			.populate("accountId");

		return docs.map(doc =>
			SubscriptionMapper.toDomain(doc)
		);
	}

	// -----------------------------
	// COUNTERS (ANALYTICS)
	// -----------------------------
	async count(filter = {}) {
		return SubscriptionModel.countDocuments(filter);
	}

	async countAllSubscriptions() {
		return SubscriptionModel.countDocuments();
	}

	async countActiveSubscriptions() {
		return SubscriptionModel.countDocuments({
			status: "active",
			endDate: { $gt: new Date() }
		});
	}
}