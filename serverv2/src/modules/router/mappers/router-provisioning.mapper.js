import { RouterProvisioning } from "../domain/router-provisioning.entity.js";
// import { extractId } from "../../../shared/utils/populate-helpers.js";

export class RouterProvisioningMapper {

	static toDomain(raw) {
		if (!raw) return null;

		return new RouterProvisioning({
			id: raw._id?.toString(),
			accountId: extractId(raw.accountId),
			subscriptionId: extractId(raw.subscriptionId),
			routerId: extractId(raw.routerId),
			status: raw.status,
			lastSyncedAt: raw.lastSyncedAt,
			lastError: raw.lastError,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt
		});
	}

	static toPersistence(entity) {
		return {
			accountId: entity.accountId,
			subscriptionId: entity.subscriptionId,
			routerId: entity.routerId,
			status: entity.status,
			lastSyncedAt: entity.lastSyncedAt,
			lastError: entity.lastError
		};
	}
}