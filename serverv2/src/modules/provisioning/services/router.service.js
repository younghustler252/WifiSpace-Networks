import { RouterCommands } from "../commands/router.commands.js";

export class RouterService {
	constructor({ mikrotikClient }) {
		this.mikrotikClient = mikrotikClient;
	}

	async getIdentity(router) {
		const request = RouterCommands.getIdentity();

		const result = await this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);

		return result?.[0] ?? null;
	}

	async getResources(router) {
		const request = RouterCommands.getResources();

		const result = await this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);

		return result?.[0] ?? null;
	}

	async getClock(router) {
		const request = RouterCommands.getClock();

		const result = await this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);

		return result?.[0] ?? null;
	}

	async getInterfaces(router) {
		const request = RouterCommands.getInterfaces();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async getAddresses(router) {
		const request = RouterCommands.getAddresses();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async getRoutes(router) {
		const request = RouterCommands.getRoutes();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async getDns(router) {
		const request = RouterCommands.getDns();

		const result = await this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);

		return result?.[0] ?? null;
	}

	async getPackages(router) {
		const request = RouterCommands.getPackages();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async getUsers(router) {
		const request = RouterCommands.getUsers();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async getLogs(router) {
		const request = RouterCommands.getLogs();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async reboot(router) {
		const request = RouterCommands.reboot();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async shutdown(router) {
		const request = RouterCommands.shutdown();

		return this.mikrotikClient.execute(
			router,
			request.command,
			request.params
		);
	}

	async ping(router) {
		try {
			const identity = await this.getIdentity(router);

			return {
				online: true,
				identity: identity?.name ?? null
			};
		} catch (error) {
			return {
				online: false,
				error: error.message
			};
		}
	}

	async getSystemInfo(router) {
		const [
			identity,
			resources,
			clock,
			addresses,
			packages
		] = await Promise.all([
			this.getIdentity(router),
			this.getResources(router),
			this.getClock(router),
			this.getAddresses(router),
			this.getPackages(router)
		]);

		return {
			identity: identity?.name ?? null,
			version: resources?.version ?? null,
			board: resources?.boardName ?? null,
			model: resources?.platform ?? null,
			uptime: resources?.uptime ?? null,
			cpu: resources?.cpu ?? null,
			cpuCount: resources?.["cpu-count"] ?? null,
			cpuFrequency: resources?.["cpu-frequency"] ?? null,
			freeMemory: resources?.["free-memory"] ?? null,
			totalMemory: resources?.["total-memory"] ?? null,
			freeHdd: resources?.["free-hdd-space"] ?? null,
			totalHdd: resources?.["total-hdd-space"] ?? null,
			architecture: resources?.["architecture-name"] ?? null,
			clock,
			addresses,
			packages
		};
	}
}