// src/server.js
import "./config/env.js";

import app from "./app.js";
import { connectDatabase } from "./infrastructure/database/mongo.connecton.js";

import "./container/index.js";

const PORT = process.env.PORT || 3000;

let server;

const startServer = async () => {
	try {
		console.log("Connecting to infrastructure...");

		await connectDatabase();

		console.log("Infrastructure ready");

		server = app.listen(PORT, () => {
			console.log(
				`Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`
			);
		});
	} catch (err) {
		console.error("Fatal error during startup:", err);
		process.exit(1);
	}
};

const shutdown = async (signal) => {
	console.log(`Received ${signal}, shutting down...`);

	if (server) {
		server.close(() => {
			console.log("HTTP server closed");
		});
	}

	process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
