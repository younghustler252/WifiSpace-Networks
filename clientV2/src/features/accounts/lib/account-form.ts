import type { EditAccountValues } from "../schemas/accounts.schemas";
import type { AdminAccount, UpdateAccountBody } from "../types/accounts.types";

type Dirty = Partial<Record<keyof EditAccountValues, boolean | undefined>>;

export function toAccountFormValues(account: AdminAccount): EditAccountValues {
	const location = account.requestedLocation;

	return {
		serviceType: account.serviceType,
		routerId: account.routerId ?? "",
		routerProfile: account.routerProfile ?? "",
		accountType: account.accountType === "business" ? "business" : "personal",
		businessName: account.businessName ?? "",
		companyRegistrationNumber: account.companyRegistrationNumber ?? "",
		taxId: account.taxId ?? "",
		staticIp: account.staticIp ?? "",
		limitUptime: account.limitUptime !== undefined && account.limitUptime !== null ? String(account.limitUptime) : "",
		maxDevices: account.maxDevices !== undefined ? String(account.maxDevices) : "",
		address: location?.address ?? "",
		landmark: location?.landmark ?? "",
		city: location?.city ?? "",
		state: location?.state ?? "",
		lat: location?.coordinates ? String(location.coordinates.lat) : "",
		lng: location?.coordinates ? String(location.coordinates.lng) : "",
	};
}

export function buildAccountPatch(values: EditAccountValues, dirty: Dirty): UpdateAccountBody {
	const patch: UpdateAccountBody = {};

	if (dirty.routerId && values.routerId) patch.routerId = values.routerId;
	if (dirty.routerProfile && values.routerProfile) patch.routerProfile = values.routerProfile;
	if (dirty.accountType) patch.accountType = values.accountType;
	if (dirty.businessName && values.businessName) patch.businessName = values.businessName;
	if (dirty.companyRegistrationNumber && values.companyRegistrationNumber) patch.companyRegistrationNumber = values.companyRegistrationNumber;
	if (dirty.taxId && values.taxId) patch.taxId = values.taxId;
	if (dirty.staticIp && values.staticIp) patch.staticIp = values.staticIp;
	if (dirty.limitUptime && values.limitUptime) patch.limitUptime = Number(values.limitUptime);
	if (dirty.maxDevices && values.maxDevices) patch.maxDevices = Number(values.maxDevices);

	if (dirty.address || dirty.landmark || dirty.city || dirty.state || dirty.lat || dirty.lng) {
		patch.requestedLocation = {
			address: values.address,
			landmark: values.landmark || undefined,
			city: values.city || undefined,
			state: values.state || undefined,
			coordinates: values.lat && values.lng ? { lat: Number(values.lat), lng: Number(values.lng) } : undefined,
		};
	}

	return patch;
}