import { formatUptime } from "../../../shared/utils/formatUptime.js";

export class HotspotCommands {
	static createUser({
		username,
		password,
		profile = "default",
		limitUptime
	}) {
		const params = [
			`=name=${username}`,
			`=password=${password}`,
			`=profile=${profile}`
		];

		if (limitUptime && Number(limitUptime) > 0) {
			params.push(
				`=limit-uptime=${formatUptime(Number(limitUptime))}`
			);
		}

		return {
			command: "/ip/hotspot/user/add",
			params
		};
	}

	static findUser(username) {
		return {
			command: "/ip/hotspot/user/print",
			params: [`?name=${username}`]
		};
	}

	static updateUser({
		id,
		profile = "default",
		limitUptime
	}) {
		const params = [
			`=.id=${id}`,
			`=profile=${profile}`
		];

		if (limitUptime && Number(limitUptime) > 0) {
			params.push(
				`=limit-uptime=${formatUptime(Number(limitUptime))}`
			);
		} else {
			params.push("=limit-uptime=00:00:00");
		}

		return {
			command: "/ip/hotspot/user/set",
			params
		};
	}

	static changePassword({
		id,
		password
	}) {
		return {
			command: "/ip/hotspot/user/set",
			params: [
				`=.id=${id}`,
				`=password=${password}`
			]
		};
	}

	static suspendUser(id) {
		return {
			command: "/ip/hotspot/user/set",
			params: [
				`=.id=${id}`,
				"=disabled=yes"
			]
		};
	}

	static resumeUser(id) {
		return {
			command: "/ip/hotspot/user/set",
			params: [
				`=.id=${id}`,
				"=disabled=no"
			]
		};
	}

	static getProfiles() {
		return {
			command: "/ip/hotspot/user/profile/print",
			params: []
		};
	}

	static getActiveSessions(username) {
		const params = [];

		if (username) {
			params.push(`?user=${username}`);
		}

		return {
			command: "/ip/hotspot/active/print",
			params
		};
	}

	static disconnectSession(id) {
		return {
			command: "/ip/hotspot/active/remove",
			params: [`=.id=${id}`]
		};
	}

	static findHost(macAddress) {
		return {
			command: "/ip/hotspot/host/print",
			params: [`?mac-address=${macAddress}`]
		};
	}

	static login({
		username,
		password,
		ipAddress
	}) {
		return {
			command: "/ip/hotspot/active/login",
			params: [
				`=user=${username}`,
				`=password=${password}`,
				`=ip=${ipAddress}`
			]
		};
	}

	static findMacBinding(macAddress) {
		return {
			command: "/ip/hotspot/ip-binding/print",
			params: [`?mac-address=${macAddress}`]
		};
	}

	static addMacBinding({
		macAddress,
		comment
	}) {
		return {
			command: "/ip/hotspot/ip-binding/add",
			params: [
				`=mac-address=${macAddress}`,
				"=type=regular",
				`=comment=${comment}`
			]
		};
	}

	static setUserMac({
		id,
		macAddress
	}) {
		return {
			command: "/ip/hotspot/user/set",
			params: [
				`=.id=${id}`,
				`=mac-address=${macAddress}`
			]
		};
	}
}