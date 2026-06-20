import { RouterOSAPI } from "node-routeros";
import PQueue from "p-queue";

export class MikrotikClient {
	constructor({ agentService } = {}) {
		this.connections = new Map();
		this.queues = new Map();
		this.agentService = agentService;
	}

	getRouterKey(router) {
		return `${router.host}:${router.port || 8728}`;
	}

	getQueue(routerKey) {
		if (!this.queues.has(routerKey)) {
			this.queues.set(routerKey, new PQueue({ concurrency: 1 }));
		}
		return this.queues.get(routerKey);
	}

	// -----------------------------
	// CONNECT DIRECT
	// -----------------------------
	async connect(router) {
		const routerKey = this.getRouterKey(router);

		if (this.connections.has(routerKey)) {
			return this.connections.get(routerKey);
		}

		const conn = new RouterOSAPI({
			host: router.host,
			user: router.username,
			password: router.password,
			port: router.port || 8728,
			timeout: 5000,
		});

		await conn.connect();

		conn.on("close", () => this.connections.delete(routerKey));
		conn.on("error", () => this.connections.delete(routerKey));

		this.connections.set(routerKey, conn);

		return conn;
	}

	// -----------------------------
	// TYPE DETECTION
	// -----------------------------
	isReadCommand(command) {
		return (
			command.includes("print") ||
			command.includes("resource") ||
			command.includes("identity") ||
			command.includes("active")
		);
	}

	// -----------------------------
	// MAIN EXECUTION
	// -----------------------------
	async execute(router, command, params = [], retries = 3) {

		const routerKey = this.getRouterKey(router);

		// =========================
		// AGENT MODE
		// =========================
		if (router.connectionType === "agent") {
			return this.executeViaAgent(router, command, params);
		}

		// =========================
		// DIRECT MODE
		// =========================
		const queue = this.getQueue(routerKey);

		return queue.add(async () => {
			for (let attempt = 1; attempt <= retries; attempt++) {
				try {
					let conn = this.connections.get(routerKey);

					if (!conn) {
						conn = await this.connect(router);
					}

					const timeout = new Promise((_, reject) =>
						setTimeout(() => {
							reject(new Error(`MikroTik timeout: ${router.host}`));
						}, 5000)
					);

					const result = await Promise.race([
						conn.write(command, params),
						timeout,
					]);

					return result;

				} catch (err) {
					this.connections.delete(routerKey);

					if (attempt === retries) throw err;

					await new Promise(r =>
						setTimeout(r, 1000 * attempt)
					);
				}
			}
		});
	}

	// -----------------------------
	// AGENT MODE (UPDATED)
	// -----------------------------
	async executeViaAgent(router, command, params) {
    if (!router.connectorId) throw new Error("Router missing connectorId");
    if (!this.agentService) throw new Error("AgentService not injected");

    return await this.agentService.executeCommand(router.connectorId, {
        router,
        command,
        params,
    });
}
	// -----------------------------
	// CLEANUP
	// -----------------------------
	async disconnect(router) {
		const key = this.getRouterKey(router);
		const conn = this.connections.get(key);

		if (conn) {
			await conn.close().catch(() => {});
			this.connections.delete(key);
		}
	}

	async disconnectAll() {
		for (const [key, conn] of this.connections) {
			await conn.close().catch(() => {});
			this.connections.delete(key);
		}
	}

	// -----------------------------
	// HEALTH CHECK
	// -----------------------------
	async ping(router) {
		try {
			const result = await this.execute(router, "/system/identity/print");

			return {
				online: true,
				identity: result?.[0]?.name || null,
			};
		} catch (err) {
			return {
				online: false,
				error: err.message,
			};
		}
	}
}