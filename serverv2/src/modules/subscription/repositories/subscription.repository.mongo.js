// repositories/subscription.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import SubscriptionModel from "../database/subscription.model.js";
import { SubscriptionMapper } from "../mappers/subscription.mapper.js";
import { SUBSCRIPTION_STATUSES } from "../domain/subscription.enum.js";

export class SubscriptionRepositoryMongo extends BaseRepository {
	constructor() {
		super(SubscriptionModel, SubscriptionMapper);
	}

	async findCurrentByAccountId(accountId) {
		const doc = await this.model
			.findOne({ accountId, status: { $in: [SUBSCRIPTION_STATUSES.PENDING, SUBSCRIPTION_STATUSES.ACTIVE] } })
			.sort({ createdAt: -1 })
			.lean();
		return this.mapOne(doc);
	}

	async findByAccountId(accountId) {
		const docs = await this.model.find({ accountId }).sort({ createdAt: -1 }).lean();
		return this.mapArray(docs);
	}

	async findByUserId(userId) {
		const docs = await this.model.find({ userId }).sort({ createdAt: -1 }).lean();
		return this.mapArray(docs);
	}

	async findDueForExpiry(now = new Date()) {
		const docs = await this.model.find({
			status: SUBSCRIPTION_STATUSES.ACTIVE,
			$or: [{ graceEndsAt: { $lte: now } }, { graceEndsAt: null, expiresAt: { $lte: now } }]
		}).lean();
		return this.mapArray(docs);
	}

	async findDueForAutoRenewal(now = new Date()) {
		const docs = await this.model.find({
			autoRenewEnabled: true, status: SUBSCRIPTION_STATUSES.ACTIVE, nextRenewalDate: { $lte: now }
		}).lean();
		return this.mapArray(docs);
	}

	async update(id, entityOrData) {
		const persistence = SubscriptionMapper.toPersistence(entityOrData);
		await this.model.findByIdAndUpdate(id, persistence, { new: true });
		return this.findById(id);
	}

	// add to subscription.repository.mongo.js
	async findAllActive() {
		const docs = await this.model.find({ status: "active" }).lean();
		return this.mapArray(docs);
	}
}