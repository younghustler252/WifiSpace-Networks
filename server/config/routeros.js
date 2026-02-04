const { RouterOSAPI } = require("node-routeros");
const PQueue = require("p-queue").default;

/**
 * ---------------- CONFIG ----------------
 */
const config = {
	host: process.env.ROUTEROS_HOST,
	user: process.env.ROUTEROS_USER,
	// password: process.env.ROUTEROS_PASS,
	port: Number(process.env.ROUTEROS_PORT) || 8728,
	timeout: 10000,
	ssl: false,
	keepalive: true 
};

/**
 * ---------------- STATE ----------------
 */
let conn = null;
let connected = false;
let connecting = false;

const queue = new PQueue({ concurrency: 1 });

let retryDelay = 2000;
const MAX_RETRY_DELAY = 30000;

/**
 * ---------------- UTILS ----------------
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const logError = (prefix, err) => {
	console.error(
		prefix,
		err?.message || err?.code || err || "Unknown error"
	);
};

/**
 * ---------------- CONNECTION ----------------
 */
async function connectRouter() {
	while (!connected) {
		if (connecting) {
			await sleep(500);
			continue;
		}

		connecting = true;

		try {
			console.log("⏳ Connecting to MikroTik...");

			conn = new RouterOSAPI(config);
			await conn.connect();

			connected = true;
			connecting = false;
			retryDelay = 2000;

			console.log("✅ Connected to MikroTik");

			conn.on("error", handleRouterError);
			conn.on("close", () => {
				console.warn("⚠️ RouterOS connection closed");
				connected = false;
			});

		} catch (err) {
			logError("❌ RouterOS connection failed:", err);

			connected = false;
			connecting = false;

			console.log(`🔁 Retrying in ${retryDelay / 1000}s...`);
			await sleep(retryDelay);

			retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
		}
	}
}

/**
 * ---------------- ERROR HANDLING ----------------
 */
function handleRouterError(err) {
	logError("⚠️ RouterOS connection error:", err);
	connected = false;
}

/**
 * ---------------- WAIT FOR CONNECTION ----------------
 */
function waitForConnection() {
	return new Promise((resolve) => {
		if (connected) return resolve();

		const interval = setInterval(() => {
			if (connected) {
				clearInterval(interval);
				resolve();
			}
		}, 500);
	});
}

/**
 * ---------------- COMMAND EXECUTION ----------------
 */
async function runCommand(cmd) {
	return queue.add(async () => {
		await waitForConnection();

		try {
			return await conn.write(cmd);
		} catch (err) {
			logError("❌ RouterOS command failed:", err);
			connected = false;
			throw err;
		}
	});
}

/**
 * ---------------- GRACEFUL SHUTDOWN ----------------
 */
async function shutdown() {
	console.log("🛑 Closing RouterOS connection...");
	try {
		if (conn) await conn.close();
	} catch (err) {
		logError("⚠️ Error closing RouterOS connection:", err);
	}
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * ---------------- EXPORTS ----------------
 */
module.exports = {
	connectRouter,
	runCommand,
};
