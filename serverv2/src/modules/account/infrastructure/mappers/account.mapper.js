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

			// UI object (new addition — Option B)
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
			pppoePassword: raw.pppoePassword,

			routerId: raw.routerId,
			routerProfile: raw.routerProfile,

			profileStatus: raw.profileStatus,
			serviceType: raw.serviceType,

			lastSeenAt: raw.lastSeenAt,
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
			pppoePassword: account.pppoePassword,

			routerId: account.routerId,
			routerProfile: account.routerProfile,

			profileStatus: account.profileStatus,
			serviceType: account.serviceType,

			lastSeenAt: account.lastSeenAt,
		};
	}
}