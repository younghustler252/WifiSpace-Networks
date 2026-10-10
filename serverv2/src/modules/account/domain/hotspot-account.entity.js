import { Account } from "./account.entity.js";
import { SERVICE_TYPES } from "./account.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class HotspotAccount extends Account {
	constructor({ maxDevices = 1, devices = [], ...rest }) {
		super({ ...rest, serviceType: SERVICE_TYPES.HOTSPOT, devices });
		this.maxDevices = maxDevices;
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