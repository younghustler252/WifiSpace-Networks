import dotenv from "dotenv";
import mongoose from "mongoose";

// import { up as migration001 } from "./001-migrate-plans.js";
// import { up as migration002 } from "./002-migrate-accounts.js";
// import { up as migration003 } from "./003-migrate-subscriptions.js";
import { up as migration004 } from "./migrate-router.js";

dotenv.config({
    path: ".env.development",
});

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected");

        const db = mongoose.connection.db;

        // await migration001(db);
        // await migration002(db);
        // await migration003(db);
        await migration004(db);

        console.log("All migrations complete");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();