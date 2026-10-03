// src/worker.js
import "./config/env.js";

import { connectDatabase } from "./infrastructure/database/mongo.connecton.js";
import { container } from "./container/index.js";
import { startJobs } from "./infrastructure/jobs/index.js";

const start = async () => {
    try {
        await connectDatabase();

        console.log("Starting background jobs...");
        await startJobs();

        console.log("Worker started");
    } catch (err) {
        console.error("Worker failed to start:", err);
        process.exit(1);
    }
};

const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down worker...`);

    try {
        const mikrotikClient = container.resolve("mikrotikClient");
        await mikrotikClient.disconnectAll();
    } catch (err) {
        console.error("Error closing router connections:", err);
    } finally {
        process.exit(0);
    }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

await start();
