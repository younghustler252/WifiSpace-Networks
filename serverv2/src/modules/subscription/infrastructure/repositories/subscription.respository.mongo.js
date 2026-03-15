import SubscriptionModel from "../database/mongoose/subscription.model.js";
import { SubscriptionRepository } from "../../domain/subscripton.repository.js";
import { SubscriptionMapper } from "../mappers/subscription.mapper.js";

export class SubscriptionRepositoryMongo extends SubscriptionRepository {

	async create(subscription) {

		const data = SubscriptionMapper.toPersistence(subscription);

		const doc = await SubscriptionModel.create(data);

		return SubscriptionMapper.toDomain(doc);
	}

	async findById(id) {

		const doc = await SubscriptionModel
			.findById(id)
			.populate("planId")
			.populate("accountId");

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	async findByAccountId(accountId) {

		const docs = await SubscriptionModel
			.find({ accountId })
			.populate("planId");

		return docs.map(doc => SubscriptionMapper.toDomain(doc));
	}

	async findActiveByAccount(accountId) {

		const doc = await SubscriptionModel
			.findOne({
				accountId,
				status: "active"
			})
			.populate("planId");

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	async findExpired(now) {

		const docs = await SubscriptionModel.find({
			endDate: { $lt: now },
			status: "active"
		});

		return docs.map(doc => SubscriptionMapper.toDomain(doc));
	}

	async update(id, updateData) {

		const doc = await SubscriptionModel.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

	async updateStatus(id, status) {

		const doc = await SubscriptionModel.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		);

		if (!doc) return null;

		return SubscriptionMapper.toDomain(doc);
	}

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

		return docs.map(doc => SubscriptionMapper.toDomain(doc));
	}

	async count(filter = {}) {

		return SubscriptionModel.countDocuments(filter);
	}
}