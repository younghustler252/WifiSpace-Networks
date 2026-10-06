export class RouterProvisioningMapper {
	static toDomain(raw) {
		if (!raw) return null;

		return {
			id: raw._id?.toString() || raw.id,
			accountId: raw.accountId?._id?.toString() || raw.accountId?.toString(),
			subscriptionId: raw.subscriptionId?._id?.toString() || raw.subscriptionId?.toString(),
			routerId: raw.routerId?._id?.toString() || raw.routerId?.toString(),
			router: raw.routerId && typeof raw.routerId === "object" ? raw.routerId : null,
			status: raw.status,
			lastSyncedAt: raw.lastSyncedAt,
			lastError: raw.lastError,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt
		};
	}

	static toPersistence(data) {
		const out = {
			accountId: data.accountId,
			subscriptionId: data.subscriptionId,
			routerId: data.routerId,
			status: data.status,
			lastSyncedAt: data.lastSyncedAt,
			lastError: data.lastError
		};

		return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined));
	}
}
