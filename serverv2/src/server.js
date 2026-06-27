import "./config/env.js"; 

import app from "./app.js";
import { connectDatabase } from "./shared/infrastructure/database/mongo.connecton.js";
import redisClient from "./config/redisClient.js";
import { startWorkers } from "./shared/worker/index.js";
import { startCrons } from "./shared/jobs/index.js";

const PORT = process.env.PORT || 3000;
let server; 
const startServer = async () => {
	try {
		console.log("⏳ Initializing system infrastructure dependencies...");

		await connectDatabase();

		await redisClient.set("test", "ok");

		await startWorkers();

		await startCrons();

		console.log("✅ All connections and scheduling handlers initialized");

		server = app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
		});
	} catch (err) {
		console.error("❌ Fatal system crash encountered during initialization:", err);
		process.exit(1);
	}
};

// ========================================================
// 🔥 PRODUCTION GRACEFUL SHUTDOWN ARCHITECTURE LAYER
// ========================================================
const handleGracefulShutdown = async (signal) => {
	console.log(`\n🛑 Received ${signal} signal. Initiating safe platform teardown sequence...`);

	if (server) {
		server.close(() => {
			console.log("🔒 HTTP API gateway closed. No longer accepting new requests.");
		});
	}

	try {
		// Disconnect from your Redis cache/queue safely so tasks aren't corrupted
		if (redisClient) {
			await redisClient.quit();
			console.log("🔌 Redis client connection dropped safely.");
		}

		console.log("👋 System shutdown complete. Exiting thread process safely.");
		process.exit(0);
	} catch (error) {
		console.error("⚠️ Error cleanups failed during teardown script runtime:", error);
		process.exit(1);
	}
};

// Catch process management platform termination events
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM")); // Handled by cloud scaling nodes
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));   // Handled by terminal close (Ctrl+C)

// Boot up server engine process
startServer();
