import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./shared/infrastructure/database/mongo.connecton.js";
import { mikrotikClient } from "./modules/mikrotik/infrastructure/client/mikrotik.client.js";

// Load correct .env file
const envFile = process.env.NODE_ENV === "production"
	? ".env.production"
	: ".env.development";

dotenv.config({ path: envFile });

const PORT = process.env.PORT || 3000;

const startServer = async () => {
	try {
		// Initialize connections
		await connectDatabase();
		await redisClient.set("test", "ok");
		await mikrotikClient.connect();

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