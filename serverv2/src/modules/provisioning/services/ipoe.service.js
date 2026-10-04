import { IpoeCommands } from "../commands/ipoe.command.js";

const SUSPENDED_LIST = "ipoe-suspended";

export class IpoeService {
	constructor({ mikrotikClient }) {
		this.mikrotikClient = mikrotikClient;
	}

	async findLease(router, macAddress) {
		const request = IpoeCommands.findLease(macAddress);
		const leases = await this.mikrotikClient.execute(router, request.command, request.params);
		return leases?.[0] ?? null;
	}

	async ensureStaticLease(router, { macAddress, ipAddress, server = null, comment = null }) {
		const existing = await this.findLease(router, macAddress);

		if (!existing) {
			const request = IpoeCommands.addStaticLease({ macAddress, ipAddress, server, comment });
			return this.mikrotikClient.execute(router, request.command, request.params);
		}

		if (existing.address !== ipAddress) {
			const request = IpoeCommands.updateLease({ id: existing[".id"], ipAddress });
			return this.mikrotikClient.execute(router, request.command, request.params);
		}

		return existing;
	}

	async setSpeed(router, { wsnId, ipAddress, maxLimit, comment = null }) {
		const request = IpoeCommands.findSimpleQueue(wsnId);
		const queues = await this.mikrotikClient.execute(router, request.command, request.params);
		const existing = queues?.[0] ?? null;

		if (!existing) {
			const addRequest = IpoeCommands.addSimpleQueue({ name: wsnId, target: `${ipAddress}/32`, maxLimit, comment });
			return this.mikrotikClient.execute(router, addRequest.command, addRequest.params);
		}

		const updateRequest = IpoeCommands.updateSimpleQueue({ id: existing[".id"], maxLimit, target: `${ipAddress}/32` });
		return this.mikrotikClient.execute(router, updateRequest.command, updateRequest.params);
	}

	async suspend(router, ipAddress, comment = null) {
		const findRequest = IpoeCommands.findAddressListEntry({ list: SUSPENDED_LIST, address: ipAddress });
		const existing = await this.mikrotikClient.execute(router, findRequest.command, findRequest.params);
		if (existing?.length) return existing[0];

		const request = IpoeCommands.addToAddressList({ list: SUSPENDED_LIST, address: ipAddress, comment });
		return this.mikrotikClient.execute(router, request.command, request.params);
	}

	async resume(router, ipAddress) {
		const findRequest = IpoeCommands.findAddressListEntry({ list: SUSPENDED_LIST, address: ipAddress });
		const existing = await this.mikrotikClient.execute(router, findRequest.command, findRequest.params);
		if (!existing?.length) return { success: true, alreadyResumed: true };

		const request = IpoeCommands.removeFromAddressList(existing[0][".id"]);
		await this.mikrotikClient.execute(router, request.command, request.params);
		return { success: true };
	}

	async isSuspended(router, ipAddress) {
		const findRequest = IpoeCommands.findAddressListEntry({ list: SUSPENDED_LIST, address: ipAddress });
		const existing = await this.mikrotikClient.execute(router, findRequest.command, findRequest.params);
		return Boolean(existing?.length);
	}
}