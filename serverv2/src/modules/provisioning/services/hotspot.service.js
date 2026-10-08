import { HotspotCommands } from "../commands/hotspot.commands.js";

export class HotspotService {
	constructor({ mikrotikClient }) {
		this.mikrotikClient = mikrotikClient;
	}

	async createUser(router, account) {
		const request = HotspotCommands.createUser({
			username: account.wsnId,
			password: account.routerPassword,
			profile: account.routerProfile,
			limitUptime: account.limitUptime
		});

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async updateUser(router, account) {
		const user = await this.getUser(
			router,
			account.wsnId
		);

		if (!user) {
			throw new Error(
				`Hotspot user not found: ${account.wsnId}`
			);
		}

		const request = HotspotCommands.updateUser({
			id: user[".id"],
			profile: account.routerProfile,
			limitUptime: account.limitUptime
		});

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async removeUser(router, username) {
		const user = await this.getUser(router, username);
		if (!user) return { success: true, removed: false };

		await this.disconnectUser(router, username);
		const request = HotspotCommands.removeUser(user[".id"]);
		await this.mikrotikClient.execute(router, request.command, request.params);
		return { success: true, removed: true };
	}
	async changePassword(
		router,
		username,
		password
	) {
		const user = await this.getUser(
			router,
			username
		);

		if (!user) {
			throw new Error(
				`Hotspot user not found: ${username}`
			);
		}

		const request =
			HotspotCommands.changePassword({
				id: user[".id"],
				password
			});

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async suspendUser(router, username) {
		const user = await this.getUser(
			router,
			username
		);

		if (!user) {
			throw new Error(
				`Hotspot user not found: ${username}`
			);
		}

		const request =
			HotspotCommands.suspendUser(
				user[".id"]
			);

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async resumeUser(router, username) {
		const user = await this.getUser(
			router,
			username
		);

		if (!user) {
			throw new Error(
				`Hotspot user not found: ${username}`
			);
		}

		const request =
			HotspotCommands.resumeUser(
				user[".id"]
			);

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async disconnectUser(router, username) {
		const session =
			await this.getActiveSession(
				router,
				username
			);

		if (!session) {
			return {
				success: true,
				disconnected: false
			};
		}

		const request =
			HotspotCommands.disconnectSession(
				session[".id"]
			);

		await this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);

		return {
			success: true,
			disconnected: true
		};
	}

	async bindMac(
		router,
		{ username, macAddress }
	) {
		const existing =
			await this.findMacBinding(
				router,
				macAddress
			);

		if (existing) {
			return existing;
		}

		const request =
			HotspotCommands.addMacBinding({
				macAddress,
				comment: username
			});

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async setUserMac(
		router,
		{ username, macAddress }
	) {
		const user = await this.getUser(
			router,
			username
		);

		if (!user) {
			throw new Error(
				`Hotspot user not found: ${username}`
			);
		}

		const request =
			HotspotCommands.setUserMac({
				id: user[".id"],
				macAddress
			});

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async login(
		router,
		{
			username,
			password,
			ipAddress
		}
	) {
		const request =
			HotspotCommands.login({
				username,
				password,
				ipAddress
			});

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async getProfiles(router) {
		const request =
			HotspotCommands.getProfiles();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async getUser(
		router,
		username
	) {
		const request =
			HotspotCommands.findUser(
				username
			);

		const users =
			await this.mikrotikClient.execute(
				router,
				request.command,
				request.params
			);

		return users?.[0] ?? null;
	}

	async userExists(
		router,
		username
	) {
		return !!(
			await this.getUser(
				router,
				username
			)
		);
	}

	async getActiveSession(
		router,
		username
	) {
		const request =
			HotspotCommands.getActiveSessions(
				username
			);

		const sessions =
			await this.mikrotikClient.execute(
				router,
				request.command,
				request.params
			);

		return sessions?.[0] ?? null;
	}
	async getActiveSessions(router) {
		const request =
			HotspotCommands.getActiveSessions();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async findHost(
		router,
		macAddress
	) {
		const request =
			HotspotCommands.findHost(
				macAddress
			);

		const hosts =
			await this.mikrotikClient.execute(
				router,
				request.command,
				request.params
			);

		return hosts?.[0] ?? null;
	}

	async findMacBinding(
		router,
		macAddress
	) {
		const request =
			HotspotCommands.findMacBinding(
				macAddress
			);

		const bindings =
			await this.mikrotikClient.execute(
				router,
				request.command,
				request.params
			);

		return bindings?.[0] ?? null;
	}
}