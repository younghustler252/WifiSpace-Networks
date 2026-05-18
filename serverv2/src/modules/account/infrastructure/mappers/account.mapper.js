import { Account } from "../../domain/account.entity.js";

export class AccountMapper {

	static toDomain(raw) {
		if (!raw) return null;

		const user = raw.userId; 
		const isPopulated = user && typeof user === "object" && user._id;

		return new Account({
			id: raw._id?.toString(),

			// raw reference ONLY (never mutate)
			userId: isPopulated
				? user._id.toString()
				: user?.toString(),

			// UI object (optional, if user is populated)
			user: isPopulated
				? {
						id: user._id.toString(),
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
						avatar: user.avatar,
				  }
				: null,

			accountType: raw.accountType,
			businessName: raw.businessName,
			companyRegistrationNumber: raw.companyRegistrationNumber,
			taxId: raw.taxId,

			wsnId: raw.wsnId,
			routerPassword: raw.routerPassword, // UPDATED

			routerId: raw.routerId,
			routerProfile: raw.routerProfile,
			macAddress: raw.macAddress, // ADD if present in raw

			profileStatus: raw.profileStatus,
			serviceType: raw.serviceType,

			limitUptime: raw.limitUptime, // ADD monitoring fields
			lastSeenAt: raw.lastSeenAt,
			mikrotikUserCreated: raw.mikrotikUserCreated,
		});
	}

	static toPersistence(account) {
		return {
			userId: account.userId,

			accountType: account.accountType,

			businessName: account.businessName,
			companyRegistrationNumber: account.companyRegistrationNumber,
			taxId: account.taxId,

			wsnId: account.wsnId,
			routerPassword: account.routerPassword, // UPDATED

			routerId: account.routerId,
			routerProfile: account.routerProfile,
			macAddress: account.macAddress, // ADD

			profileStatus: account.profileStatus,
			serviceType: account.serviceType,

			limitUptime: account.limitUptime, // ADD
			lastSeenAt: account.lastSeenAt,
			mikrotikUserCreated: account.mikrotikUserCreated, // ADD
		};
	}
}