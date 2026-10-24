import { Account } from "./account.entity.js";
import { PPPOE_ACCESS_METHODS, SERVICE_TYPES } from "./account.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class PppoeAccount extends Account {
	constructor({
		routerId = null,
		routerProfile = "default",
		routerPassword = null,
		limitUptime = 0,
		accessMethod = PPPOE_ACCESS_METHODS.IPOE,
		macAddress = null,
		staticIp = null,
		requestedLocation = null,
		...rest
	}) {
		super({ ...rest, serviceType: SERVICE_TYPES.PPPOE });

		this.routerId = routerId;
		this.routerProfile = routerProfile;
		this.routerPassword = routerPassword; // plaintext, in-memory only — repository encrypts before persisting, never logged or returned
		this.limitUptime = limitUptime;
		this.accessMethod = accessMethod;
		this.macAddress = macAddress;
		this.staticIp = staticIp;
		this.requestedLocation = requestedLocation;

		// New PPP accounts require a password. Hydrated accounts have an id and
		// normal repository reads intentionally omit the plaintext credential.
		if (!this.id && accessMethod === PPPOE_ACCESS_METHODS.PPP && !routerPassword) {
			throw new ValidationError("routerPassword is required for PPP access accounts");
		}

		// if (accessMethod === PPPOE_ACCESS_METHODS.IPOE && !macAddress) {
		// 	throw new ValidationError("macAddress is required for IPoE access accounts");
		// }

		// if (accessMethod === PPPOE_ACCESS_METHODS.IPOE && !staticIp) {
		// 	throw new ValidationError("staticIp is required for IPoE access accounts");
		// }
	}

	updateRouterPassword(password) {
		if (!password) throw new ValidationError("Password cannot be empty");
		this.routerPassword = password;
	}

	updateRouterProfile(profile) {
		if (!profile) throw new ValidationError("Router profile cannot be empty");
		this.routerProfile = profile;
	}

	moveToRouter(routerId) {
		if (!routerId) throw new ValidationError("Router ID is required");
		this.routerId = routerId;
	}

	approve() {
		if (!this.routerId) {
			throw new ValidationError("Router ID is required before approval");
		}

		if (this.accessMethod === PPPOE_ACCESS_METHODS.PPP && !this.routerPassword) {
			throw new ValidationError("Router password is required before approval");
		}

		// if (this.accessMethod === PPPOE_ACCESS_METHODS.IPOE) {
		// 	if (!this.macAddress) {
		// 		throw new ValidationError("MAC address is required before approval");
		// 	}

		// 	if (!this.staticIp) {
		// 		throw new ValidationError("Static IP is required before approval");
		// 	}
		// }

		super.approve();
	}

	toJSON() {
		const obj = super.toJSON();
		delete obj.routerPassword;
		return obj;
	}
}
