import { Account } from "./account.entity.js";
import { ACCOUNT_TYPES, SERVICE_TYPES } from "./account.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class HotspotAccount extends Account {
	constructor({ maxDevices = 1, devices = [], routerPassword = null, ...rest }) {
		super({
			...rest,
			serviceType: SERVICE_TYPES.HOTSPOT,
			accountType: ACCOUNT_TYPES.PERSONAL,
			businessName: null,
			companyRegistrationNumber: null,
			taxId: null
		});
		this.maxDevices = maxDevices;
		this.devices = devices;
		this.routerPassword = routerPassword;
	}

	registerDevice({ macAddress, hostname = null, limit = this.maxDevices }) {
		if (!macAddress) throw new ValidationError("MAC address is required");

		const mac = macAddress.toUpperCase();
		const known = this.devices.find((d) => d.macAddress === mac);

		if (known) {
			known.lastSeenAt = new Date();
			if (hostname) known.hostname = hostname;
			return { evicted: [] };
		}

		const evicted = [];
		const oldestFirst = [...this.devices].sort((a, b) => new Date(a.lastSeenAt) - new Date(b.lastSeenAt));

		while (this.devices.length >= limit && oldestFirst.length) {
			const oldest = oldestFirst.shift();
			this.devices = this.devices.filter((d) => d.macAddress !== oldest.macAddress);
			evicted.push(oldest);
		}

		this.devices.push({ macAddress: mac, hostname, lastSeenAt: new Date() });
		return { evicted };
	}

	canAddDevice() {
		return this.devices.length < this.maxDevices;
	}

	addDevice({ macAddress, hostname = null }) {
		if (!macAddress) throw new ValidationError("MAC address is required");
		if (!this.canAddDevice()) throw new ValidationError(`Device limit reached (${this.maxDevices})`);

		const normalized = macAddress.toUpperCase();
		if (this.devices.some((d) => d.macAddress === normalized)) {
			throw new ValidationError("Device already registered");
		}

		this.devices.push({ macAddress: normalized, hostname, lastSeenAt: new Date() });
	}

	updateDeviceLastSeen(macAddress, date = new Date()) {
		const device = this.devices.find((d) => d.macAddress === macAddress.toUpperCase());
		if (device) device.lastSeenAt = date;
	}

	removeDevice(macAddress) {
		this.devices = this.devices.filter((d) => d.macAddress !== macAddress.toUpperCase());
	}

	toJSON() {
		const obj = super.toJSON();
		delete obj.routerPassword;
		delete obj.routerPasswordEncrypted;
		return obj;
	}
}