import { Account } from "../domain/account.entity.js";

export class AccountMapper {

	static toDomain(raw) {
		if (!raw) return null;

		const user = raw.userId;
		const isUserPopulated = user && typeof user === "object" && user._id;

		const approver = raw.approvedBy;
		const isApproverPopulated = approver && typeof approver === "object" && approver._id;

		return new Account({
			id: raw._id?.toString(),

			userId: isUserPopulated ? user._id.toString() : user?.toString(),
			user: isUserPopulated
				? {
					id: user._id.toString(),
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					avatar: user.avatar,
				}
				: null,

			accountType: raw.accountType,

			businessName: raw.businessName ?? null,
			companyRegistrationNumber: raw.companyRegistrationNumber ?? null,
			taxId: raw.taxId ?? null,

			wsnId: raw.wsnId,
			routerPassword: raw.routerPassword,

			routerId: raw.routerId,
			routerProfile: raw.routerProfile,

			devices: Array.isArray(raw.devices)
				? raw.devices.map(d => ({
					macAddress: d.macAddress?.toUpperCase(),
					hostname: d.hostname ?? null,
					lastSeenAt: d.lastSeenAt ?? null
				}))
				: [],

			serviceType: raw.serviceType,

			approvalStatus: raw.approvalStatus,
			approvalNote: raw.approvalNote ?? null,
			approvedAt: raw.approvedAt ?? null,
			approvedBy: isApproverPopulated ? approver._id.toString() : approver?.toString() ?? null,
			approver: isApproverPopulated
				? {
					id: approver._id.toString(),
					firstName: approver.firstName,
					lastName: approver.lastName,
					email: approver.email,
				}
				: null,

			limitUptime: raw.limitUptime,

			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt
		});
	}

	static toPersistence(account) {
		return {
			userId: account.userId,

			accountType: account.accountType,

			businessName: account.businessName ?? null,
			companyRegistrationNumber: account.companyRegistrationNumber ?? null,
			taxId: account.taxId ?? null,

			wsnId: account.wsnId,
			routerPassword: account.routerPassword,

			routerId: account.routerId,
			routerProfile: account.routerProfile,

			devices: Array.isArray(account.devices)
				? account.devices.map(d => ({
					macAddress: d.macAddress?.toUpperCase(),
					hostname: d.hostname ?? null,
					lastSeenAt: d.lastSeenAt ?? null
				}))
				: [],

			serviceType: account.serviceType,

			approvalStatus: account.approvalStatus,
			approvalNote: account.approvalNote,
			approvedAt: account.approvedAt,
			approvedBy: account.approvedBy,

			limitUptime: account.limitUptime,
		};
	}
}