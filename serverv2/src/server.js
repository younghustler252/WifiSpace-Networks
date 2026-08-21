import "./config/env.js";

import app from "./app.js";
import { connectDatabase } from "./infrastructure/database/mongo.connecton.js";

// // New jobs bootstrap
// // New jobs bootstrap

import { startJobs } from "./infrastructure/jobs/index.js";

const PORT = process.env.PORT || 3000;

let server;

const startServer = async () => {
    try {
        console.log("⏳ Initializing system infrastructure dependencies...");

        await connectDatabase();
		
        // New BullMQ jobs
        await startJobs();

        console.log("✅ All connections and scheduling handlers initialized");

        server = app.listen(PORT, () => {
            console.log(
                `🚀 Server running on port ${PORT} in ${
                    process.env.NODE_ENV || "development"
                } mode`
            );
        });
    } catch (err) {
        console.error(
            "❌ Fatal system crash encountered during initialization:",
            err
        );
        process.exit(1);
    }
};

// ========================================================
// 🔥 PRODUCTION GRACEFUL SHUTDOWN ARCHITECTURE LAYER
// ========================================================
const handleGracefulShutdown = async (signal) => {
    console.log(
        `\n🛑 Received ${signal} signal. Initiating safe platform teardown sequence...`
    );

    if (server) {
        server.close(() => {
            console.log(
                "🔒 HTTP API gateway closed. No longer accepting new requests."
            );
        });
    }

    try {
        if (redisClient) {
            await redisClient.quit();
            console.log("🔌 Redis client connection dropped safely.");
        }

        console.log("👋 System shutdown complete. Exiting thread process safely.");
        process.exit(0);
    } catch (error) {
        console.error(
            "⚠️ Error cleanups failed during teardown script runtime:",
            error
        );
        process.exit(1);
    }
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

startServer();