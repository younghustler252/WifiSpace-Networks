import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import routerProvisioningModel from "../database/router-provisioning.model.js";
import { RouterProvisioningMapper } from "../mappers/router-provisioning.mapper.js";

export class RouterProvisioningRepositoryMongo extends BaseRepository {

	constructor() {
		super(routerProvisioningModel, RouterProvisioningMapper);
	}

	// The core write operation NetworkService needs: "record what just
	// happened for this account on this specific router" — create the
	// record if this is the first time, update it if not. Relies on the
	// unique (accountId, routerId) index in the schema.
	async upsertForAccountRouter({ accountId, subscriptionId, routerId, status, lastError = null }) {
		const doc = await routerProvisioningModel.findOneAndUpdate(
			{ accountId, routerId },
			{
				accountId,
				subscriptionId,
				routerId,
				status,
				lastSyncedAt: status === "synced" ? new Date() : undefined,
				lastError: status === "failed" ? lastError : null
			},
			{ upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
		);

		return this.mapOne(doc);
	}

	async findByAccountAndRouter(accountId, routerId) {
		return super.findOne({ filter: { accountId, routerId } });
	}

	// What GetHotspotSession will call, per-router, to answer "is this
	// account actually provisioned HERE specifically."
	async findAllByAccount(accountId) {
		const docs = await routerProvisioningModel.find({ accountId }).lean();
		return this.mapArray(docs);
	}

	// The downtime-notification query — cheap and direct now that this is
	// its own indexed collection instead of nested arrays on Subscription.
	async findAllByRouter(routerId, { status = null } = {}) {
		const filter = { routerId };
		if (status) filter.status = status;

		const docs = await routerProvisioningModel.find(filter).populate("accountId").lean();
		return this.mapArray(docs);
	}
}