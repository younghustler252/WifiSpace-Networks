import { RouterOSAPI } from "node-routeros";
import PQueue from "p-queue";

export class MikrotikClient {
	constructor() {
		this.connections = new Map();
		this.queues = new Map();
	}

	getRouterKey(router) {
		return `${router.host}:${router.port || 8728}`;
	}

	getQueue(routerKey) {
		if (!this.queues.has(routerKey)) {
			this.queues.set(
				routerKey,
				new PQueue({ concurrency: 1 })
			);
		}

		return this.queues.get(routerKey);
	}

	async connect(router) {
		const key = this.getRouterKey(router);

		if (this.connections.has(key)) {
			return this.connections.get(key);
		}

		const connection = new RouterOSAPI({
			host: router.host,
			user: router.username,
			password: router.password,
			port: router.port || 8728,
			timeout: 5000
		});

		await connection.connect();

		connection.on("close", () => {
			this.connections.delete(key);
		});

		connection.on("error", () => {
			this.connections.delete(key);
		});

		this.connections.set(key, connection);

		return connection;
	}

	async execute(
		router,
		command,
		params = [],
		retries = 3
	) {
		const key = this.getRouterKey(router);
		const queue = this.getQueue(key);

		return queue.add(async () => {
			for (let attempt = 1; attempt <= retries; attempt++) {
				try {
					let connection =
						this.connections.get(key);

					if (!connection) {
						connection =
							await this.connect(router);
					}

					return await this.withTimeout(
						connection.write(command, params),
						router
					);
				} catch (error) {
					this.connections.delete(key);

					if (attempt === retries) {
						throw error;
					}

					await this.sleep(attempt * 1000);
				}
			}
		});
	}

	async disconnect(router) {
		const key = this.getRouterKey(router);
		const connection = this.connections.get(key);

		if (!connection) return;

		try {
			await connection.close();
		} finally {
			this.connections.delete(key);
		}
	}

	async disconnectAll() {
		for (const [key, connection] of this.connections) {
			try {
				await connection.close();
			} finally {
				this.connections.delete(key);
			}
		}
	}

	async withTimeout(promise, router) {
		const timeout = new Promise((_, reject) => {
			setTimeout(() => {
				reject(
					new Error(
						`MikroTik request timed out (${router.host})`
					)
				);
			}, 5000);
		});

		return Promise.race([
			promise,
			timeout
		]);
	}

	sleep(ms) {
		return new Promise(resolve => {
			setTimeout(resolve, ms);
		});
	}
}