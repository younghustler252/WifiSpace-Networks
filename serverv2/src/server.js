import "./config/env.js"; 

import app from "./app.js";
// impoort redis
import { connectDatabase } from "./shared/infrastructure/database/mongo.connecton.js";
import redisClient from "./config/redisClient.js";
import {startWorkers} from "./shared/worker/index.js";
import {startCrons} from "./shared/jobs/index.js";


const PORT = process.env.PORT || 3000;

const startServer = async () => {
	try {
		// Initialize connections
		await connectDatabase();
		await redisClient.set("test", "ok");
		startWorkers();
		startCrons();

		console.log("✅ All connections initialized");

		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
		});
	} catch (err) {
		console.error("❌ Failed to start server", err);
		process.exit(1);
	}
};

startServer();