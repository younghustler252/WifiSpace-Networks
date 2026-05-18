import { RouterOSAPI } from "node-routeros";
import PQueue from "p-queue";

class MikrotikClient {
	constructor() {
		/**
		 * Map<routerId, RouterOSAPI>
		 */
		this.connections = new Map();

		/**
		 * Map<routerId, PQueue>
		 */
		this.queues = new Map();
	}

	/**
	 * Create unique router key
	 */
	getRouterKey(router) {
		return `${router.host}:${router.port || 8728}`;
	}

	/**
	 * Get/Create queue per router
	 */
	getQueue(routerKey) {
		if (!this.queues.has(routerKey)) {
			this.queues.set(
				routerKey,
				new PQueue({
					concurrency: 1,
				})
			);
		}

		return this.queues.get(routerKey);
	}

	/**
	 * Connect to router
	 */
	async connect(router) {
		const routerKey = this.getRouterKey(router);

		// Reuse existing connection
		if (this.connections.has(routerKey)) {
			return this.connections.get(routerKey);
		}

		try {
			const conn = new RouterOSAPI({
				host: router.host,
				user: router.username,
				password: router.password,
				port: router.port || 8728,
				timeout: 5000,
			});

			await conn.connect();

			console.log(`✅ MikroTik connected: ${router.host}`);

			conn.on("close", () => {
				console.warn(`⚠️ MikroTik closed: ${router.host}`);

				this.connections.delete(routerKey);
			});

			conn.on("error", (err) => {
				console.error(`❌ MikroTik error: ${router.host}`, err);

				this.connections.delete(routerKey);
			});

			this.connections.set(routerKey, conn);

			return conn;
		} catch (err) {
			console.error(`❌ Failed to connect: ${router.host}`, err);

			this.connections.delete(routerKey);

			throw err;
		}
	}

	/**
	 * Execute MikroTik command safely
	 */
	async execute(router, command, params = [], retries = 3) {
		const routerKey = this.getRouterKey(router);

		const queue = this.getQueue(routerKey);

		return queue.add(async () => {
			for (let attempt = 1; attempt <= retries; attempt++) {
				try {
					let conn = this.connections.get(routerKey);

					if (!conn) {
						conn = await this.connect(router);
					}

					// timeout protection
					const result = await Promise.race([
						conn.write(command, params),

						new Promise((_, reject) =>
							setTimeout(() => {
								reject(
									new Error(
										`MikroTik timeout: ${router.host}`
									)
								);
							}, 5000)
						),
					]);

					return result;
				} catch (err) {
					console.error(
						`❌ MikroTik command failed (${attempt}/${retries})`,
						{
							router: router.host,
							command,
							error: err.message,
						}
					);

					// Remove broken connection
					this.connections.delete(routerKey);

					// Last retry
					if (attempt === retries) {
						throw err;
					}

					// small delay before retry
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 * attempt)
					);
				}
			}
		});
	}

	/**
	 * Disconnect one router
	 */
	async disconnect(router) {
		const routerKey = this.getRouterKey(router);

		const conn = this.connections.get(routerKey);

		if (conn) {
			try {
				await conn.close();
			} catch (err) {
				console.error("Disconnect error:", err);
			}

			this.connections.delete(routerKey);

			console.log(`🔌 Disconnected: ${router.host}`);
		}
	}

	/**
	 * Disconnect all routers
	 */
	async disconnectAll() {
		for (const [routerKey, conn] of this.connections.entries()) {
			try {
				await conn.close();
			} catch (err) {
				console.error(`Disconnect error: ${routerKey}`, err);
			}
		}

		this.connections.clear();

		console.log("🔌 All MikroTik routers disconnected");
	}

	/**
	 * Health check
	 */
	async ping(router) {
		try {
			const result = await this.execute(
				router,
				"/system/identity/print"
			);

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

export const mikrotikClient = new MikrotikClient();