// repositories/usage.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import UsageModel from "../database/usage.model.js";
import { UsageMapper } from "../mappers/usage.mapper.js";

export class UsageRepositoryMongo extends BaseRepository {
	constructor() { super(UsageModel, UsageMapper); }

	async findBySubscription(subscriptionId, { page = 1, limit = 20 } = {}) {
		return this.paginate({ filter: { subscriptionId }, page, limit, sort: { recordedAt: -1 } });
	}
}