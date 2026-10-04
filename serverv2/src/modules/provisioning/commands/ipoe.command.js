export class IpoeCommands {
	static findLease(macAddress) {
		return { command: "/ip/dhcp-server/lease/print", params: [`?mac-address=${macAddress}`] };
	}

	static addStaticLease({ macAddress, ipAddress, server, comment }) {
		const params = [
			`=mac-address=${macAddress}`,
			`=address=${ipAddress}`,
			"=dynamic=no"
		];
		if (server) params.push(`=server=${server}`);
		if (comment) params.push(`=comment=${comment}`);
		return { command: "/ip/dhcp-server/lease/add", params };
	}

	static updateLease({ id, ipAddress }) {
		return { command: "/ip/dhcp-server/lease/set", params: [`=.id=${id}`, `=address=${ipAddress}`] };
	}

	static removeLease(id) {
		return { command: "/ip/dhcp-server/lease/remove", params: [`=.id=${id}`] };
	}

	static findAddressListEntry({ list, address }) {
		return { command: "/ip/firewall/address-list/print", params: [`?list=${list}`, `?address=${address}`] };
	}

	static addToAddressList({ list, address, comment }) {
		const params = [`=list=${list}`, `=address=${address}`];
		if (comment) params.push(`=comment=${comment}`);
		return { command: "/ip/firewall/address-list/add", params };
	}

	static removeFromAddressList(id) {
		return { command: "/ip/firewall/address-list/remove", params: [`=.id=${id}`] };
	}

	static findSimpleQueue(name) {
		return { command: "/queue/simple/print", params: [`?name=${name}`] };
	}

	static addSimpleQueue({ name, target, maxLimit, comment }) {
		const params = [
			`=name=${name}`,
			`=target=${target}`,
			`=max-limit=${maxLimit}`
		];
		if (comment) params.push(`=comment=${comment}`);
		return { command: "/queue/simple/add", params };
	}

	static updateSimpleQueue({ id, maxLimit, target }) {
		const params = [`=.id=${id}`];
		if (maxLimit) params.push(`=max-limit=${maxLimit}`);
		if (target) params.push(`=target=${target}`);
		return { command: "/queue/simple/set", params };
	}

	static removeSimpleQueue(id) {
		return { command: "/queue/simple/remove", params: [`=.id=${id}`] };
	}
}