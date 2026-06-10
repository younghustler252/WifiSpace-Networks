import dotenv from "dotenv";
import mongoose from "mongoose";

import { container } from "../container/index.js";

dotenv.config({
    path: ".env.development",
});

async function run() {
    try {
        const MONGO_URI = process.env.MONGO_URI;

        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
});

        console.log("Connected to MongoDB");

        const syncAllRouters = container.resolve("syncAllRouters");

        const result = await syncAllRouters.execute();

        console.log("Sync completed:", result);

        await mongoose.disconnect();
        console.log("MongoDB connection closed");

        process.exit(0);
    } catch (err) {
        console.error("Error during execution:", err);

        try {
            await mongoose.disconnect();
        } catch (_) {}

        process.exit(1);
    }
}

run();