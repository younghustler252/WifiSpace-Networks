import dotenv from "dotenv";
import mongoose from "mongoose";

import { up as migration001 } from "./plan-service-type.js";

dotenv.config({
	path: ".env.development",
});

const MONGO_URI = process.env.MONGO_URI;

async function run() {
	try {
		await mongoose.connect(MONGO_URI);

		console.log("Connected to MongoDB");

		const db = mongoose.connection.db;

		await migration001(db);

		console.log("All migrations completed");

		process.exit(0);
	} catch (err) {
		console.error(err);

		process.exit(1);
	}
}

run();