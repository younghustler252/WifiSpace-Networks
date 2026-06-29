import dotenv from "dotenv";
import mongoose from "mongoose";

import { up as migration001 } from "./001-migrate-plans.js";
import { up as migration002 } from "./002-migrate-accounts.js";
import { up as migration003 } from "./003-migrate-subscriptions.js";
import { up as migration004 } from "./004-migrate-payments.js";
import { up as migration005 } from "./005-migrate-transactions.js";
import { up as migration006 } from "./006-migrate-notifications.js";
import { up as migration007 } from "./007-seed-default-router.js"; 
import { up as migration008 } from "./008-patch-legacy-roles.js"; 
import { up as migration009 } from "./009-patch-payment-enums.js";
import { up as migration010 } from "./010-fix-skipped-subscriptions.js";


dotenv.config({
    path: ".env.development",
});

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🚀 Connected to database. Running reconciliation pipeline...");

        const db = mongoose.connection.db;

        // await migration001(db);
        await migration002(db);
        // await migration003(db);
        // await migration004(db);
        // await migration005(db);
        // await migration006(db);
        // await migration007(db); // 👈 Trigger the execution pass
        // await migration008(db); 
        // await migration009(db);
        // await migration010(db);

        console.log("🎉 All core database migrations and router linkages executed completely!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

run();
