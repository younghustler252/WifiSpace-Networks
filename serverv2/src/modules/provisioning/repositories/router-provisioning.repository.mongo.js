// repositories/router-provisioning.repository.mongo.js
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import RouterProvisioningModel from "../database/router-provisioning.model.js";
import { RouterProvisioningMapper } from "../mappers/router-provisioning.mapper.js";

export class RouterProvisioningRepositoryMongo extends BaseRepository {
	constructor() {
		super(RouterProvisioningModel, RouterProvisioningMapper);
	}

	// The write CreateAccount/MikrotikManager.provision calls every time a
	// hotspot account gets (re-)provisioned on a router.
	async markSynced({ accountId, subscriptionId, routerId }) {
		return this.model.findOneAndUpdate(
			{ accountId, routerId },
			{ $set: { subscriptionId, status: "synced", lastSyncedAt: new Date(), lastError: null } },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
	}

	async markFailed({ accountId, routerId, error }) {
		return this.model.findOneAndUpdate(
			{ accountId, routerId },
			{ $set: { status: "failed", lastError: error } },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
	}

	async findByRouter(routerId, { status } = {}) {
		const filter = { routerId };
		if (status) filter.status = status;
		const docs = await this.model.find(filter).populate({ path: "accountId", select: "wsnId" }).lean();
		return this.mapArray(docs);
	}

	async findByAccount(accountId, { status } = {}) {
		const filter = { accountId };
		if (status) filter.status = status;
		const docs = await this.model.find(filter).populate({ path: "routerId", select: "name code location" }).lean();
		return this.mapArray(docs);
	}
}