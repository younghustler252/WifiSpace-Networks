const PROFILE = "/ip/hotspot/user/profile";
const WALLED_HOST = "/ip/hotspot/walled-garden";
const WALLED_IP = "/ip/hotspot/walled-garden/ip";

const toParams = (fields) => Object.entries(fields).map(([key, value]) => `=${key}=${value ?? ""}`);

export class RouterConfigDriver {
	constructor({ mikrotikClient }) {
		this.mikrotikClient = mikrotikClient;
	}

	listProfiles(router) {
		return this.mikrotikClient.execute(router, `${PROFILE}/print`, []);
	}

	createProfile(router, name, fields) {
		return this.mikrotikClient.execute(router, `${PROFILE}/add`, [`=name=${name}`, ...toParams(fields)]);
	}

	updateProfile(router, id, fields) {
		return this.mikrotikClient.execute(router, `${PROFILE}/set`, [`=.id=${id}`, ...toParams(fields)]);
	}

	removeProfile(router, id) {
		return this.mikrotikClient.execute(router, `${PROFILE}/remove`, [`=.id=${id}`]);
	}

	listWalledGarden(router, kind) {
		return this.mikrotikClient.execute(router, `${kind === "ip" ? WALLED_IP : WALLED_HOST}/print`, []);
	}

	createWalledGarden(router, kind, fields) {
		return this.mikrotikClient.execute(router, `${kind === "ip" ? WALLED_IP : WALLED_HOST}/add`, toParams(fields));
	}

	updateWalledGarden(router, kind, id, fields) {
		return this.mikrotikClient.execute(router, `${kind === "ip" ? WALLED_IP : WALLED_HOST}/set`, [`=.id=${id}`, ...toParams(fields)]);
	}

	removeWalledGarden(router, kind, id) {
		return this.mikrotikClient.execute(router, `${kind === "ip" ? WALLED_IP : WALLED_HOST}/remove`, [`=.id=${id}`]);
	}
}
