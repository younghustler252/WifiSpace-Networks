import { Account } from "../domain/account.entity.js";
import { PppoeAccount } from "../domain/pppoe-account.entity.js";
import { HotspotAccount } from "../domain/hotspot-account.entity.js";
import { SERVICE_TYPES } from "../domain/account.enum.js";

export class AccountMapper {
	static toDomain(raw) {
		if (!raw) return null;

		const base = {
			id: raw._id?.toString() || raw.id,
			userId: raw.userId?._id?.toString() || raw.userId?.toString(),
			user: raw.userId && typeof raw.userId === "object" ? raw.userId : null,
			accountType: raw.accountType,
			businessName: raw.businessName,
			companyRegistrationNumber: raw.companyRegistrationNumber,
			taxId: raw.taxId,
			wsnId: raw.wsnId,
			status: raw.status,
			approvalStatus: raw.approvalStatus,
			approvalNote: raw.approvalNote,
			approvedAt: raw.approvedAt,
			approvedBy: raw.approvedBy?.toString(),
			devices: raw.devices || [],
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt
		};

		if (raw.serviceType === SERVICE_TYPES.PPPOE) {
			return new PppoeAccount({
				...base,
				routerId: raw.routerId?.toString(),
				routerProfile: raw.routerProfile,
				routerPassword: raw.routerPassword ?? null,
				limitUptime: raw.limitUptime
			});
		}

		if (raw.serviceType === SERVICE_TYPES.HOTSPOT) {
			return new HotspotAccount({ ...base, maxDevices: raw.maxDevices });
		}

		return new Account(base);
	}

	static toPersistence(account) {
		const data = {
			userId: account.userId,
			accountType: account.accountType,
			businessName: account.businessName,
			companyRegistrationNumber: account.companyRegistrationNumber,
			taxId: account.taxId,
			wsnId: account.wsnId,
			status: account.status,
			approvalStatus: account.approvalStatus,
			approvalNote: account.approvalNote,
			approvedAt: account.approvedAt,
			approvedBy: account.approvedBy,
			devices: account.devices
		};

		if (account.serviceType === SERVICE_TYPES.PPPOE) {
			data.routerId = account.routerId;
			data.routerProfile = account.routerProfile;
			data.limitUptime = account.limitUptime;
			if (account.routerPassword) data.routerPassword = account.routerPassword;
		}

		if (account.serviceType === SERVICE_TYPES.HOTSPOT) {
			data.maxDevices = account.maxDevices;
		}

		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}