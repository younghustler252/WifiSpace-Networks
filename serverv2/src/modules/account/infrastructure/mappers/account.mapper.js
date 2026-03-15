import { Account } from "../../domain/account.entity.js";

export class AccountMapper {

	// ----------------------------
	// Mongo → Domain Entity
	// ----------------------------

	static toDomain(raw) {

		if (!raw) return null;

		return new Account({
			id: raw._id?.toString() || raw.id,

			userId: raw.userId,

			accountType: raw.accountType,

			businessName: raw.businessName,
			companyRegistrationNumber: raw.companyRegistrationNumber,
			taxId: raw.taxId,

			wsnId: raw.wsnId,
			pppoePassword: raw.pppoePassword,

			routerId: raw.routerId,
			routerProfile: raw.routerProfile,

			profileStatus: raw.profileStatus,

			serviceType: raw.serviceType,

			lastSeenAt: raw.lastSeenAt
		});
	}

	// ----------------------------
	// Domain → Persistence
	// ----------------------------

	static toPersistence(account) {

		return {
			userId: account.userId,

			accountType: account.accountType,

			businessName: account.businessName,
			companyRegistrationNumber: account.companyRegistrationNumber,
			taxId: account.taxId,

			wsnId: account.wsnId,
			pppoePassword: account.pppoePassword,

			routerId: account.routerId,
			routerProfile: account.routerProfile,

			profileStatus: account.profileStatus,

			serviceType: account.serviceType,

			lastSeenAt: account.lastSeenAt
		};
	}

}