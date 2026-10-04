import { PppoeCommands } from "../commands/pppoe.commands.js";

export class PppoeService {
	constructor({ mikrotikClient }) {
		this.mikrotikClient = mikrotikClient;
	}

	async createUser(router, account) {
		const request = PppoeCommands.createUser({
			username: account.wsnId,
			password: account.routerPassword,
			profile: account.routerProfile
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
				`PPP user not found: ${account.wsnId}`
			);
		}

		const request = PppoeCommands.updateUser({
			id: user[".id"],
			profile: account.routerProfile
		});

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
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
				`PPP user not found: ${username}`
			);
		}

		const request =
			PppoeCommands.changePassword({
				id: user[".id"],
				password
			});

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async suspendUser(
		router,
		username
	) {
		const user = await this.getUser(
			router,
			username
		);

		if (!user) {
			throw new Error(
				`PPP user not found: ${username}`
			);
		}

		const request =
			PppoeCommands.suspendUser(
				user[".id"]
			);

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async resumeUser(
		router,
		username
	) {
		const user = await this.getUser(
			router,
			username
		);

		if (!user) {
			throw new Error(
				`PPP user not found: ${username}`
			);
		}

		const request =
			PppoeCommands.resumeUser(
				user[".id"]
			);

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async removeUser(
		router,
		username
	) {
		const user = await this.getUser(
			router,
			username
		);

		if (!user) {
			throw new Error(
				`PPP user not found: ${username}`
			);
		}

		const request =
			PppoeCommands.removeUser(
				user[".id"]
			);

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async disconnectUser(
		router,
		username
	) {
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
			PppoeCommands.disconnectSession(
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

	async getProfiles(router) {
		const request =
			PppoeCommands.getProfiles();

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
			PppoeCommands.findUser(
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
			PppoeCommands.getActiveSessions(
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

	async getActiveSessions(
		router
	) {
		const request =
			PppoeCommands.getActiveSessions();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}
}