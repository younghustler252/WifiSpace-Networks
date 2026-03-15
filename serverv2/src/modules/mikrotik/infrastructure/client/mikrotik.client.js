import { RouterOSAPI } from "node-routeros";
import PQueue from "p-queue";
import { mikrotikConfig } from "../../../../config/mikrotik.js";

class MikrotikClient {
	constructor() {
		this.conn = null;
		this.queue = new PQueue({ concurrency: 1 });
	}

	async connect() {
		if (this.conn) return;

		try {
			this.conn = new RouterOSAPI(mikrotikConfig);
			await this.conn.connect();
			console.log("✅ Connected to MikroTik");

			this.conn.on("close", () => {
				console.warn("⚠️ MikroTik connection closed");
				this.conn = null;
			});

			this.conn.on("error", (err) => {
				console.error("⚠️ MikroTik error:", err);
				this.conn = null;
			});
		} catch (err) {
			console.error("❌ MikroTik connection failed:", err);
			this.conn = null;
			throw err;
		}
	}

	async execute(command, params = []) {
		return this.queue.add(async () => {
			if (!this.conn) await this.connect();
			return this.conn.write(command, params);
		});
	}
}

export const mikrotikClient = new MikrotikClient();