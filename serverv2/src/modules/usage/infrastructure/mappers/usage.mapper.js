import { UsageSnapshot } from "../../domain/usage.entity.js";

export class UsageMapper {
    static toDomain(doc) {
        if (!doc) return null;

        return new UsageSnapshot({
            id: doc._id?.toString(),

            accountId: doc.accountId,
            routerId: doc.routerId,

            wsnId: doc.wsnId,

            online: doc.online,

            ipAddress: doc.ipAddress,
            macAddress: doc.macAddress,

            uptime: doc.uptime,

            downloadBytes: doc.downloadBytes,
            uploadBytes: doc.uploadBytes,

            lastSeenAt: doc.lastSeenAt,

            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    static toPersistence(entity) {
        return {
            accountId: entity.accountId,
            routerId: entity.routerId,

            wsnId: entity.wsnId,

            online: entity.online,

            ipAddress: entity.ipAddress,
            macAddress: entity.macAddress,

            uptime: entity.uptime,

            downloadBytes: entity.downloadBytes,
            uploadBytes: entity.uploadBytes,

            lastSeenAt: entity.lastSeenAt
        };
    }
}