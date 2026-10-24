import mongoose from "mongoose";
import "../config/env.js";
import { HardDeleteCleanupService } from "../shared/services/hard-delete-cleanup.service.js";

const apply = process.argv.includes("--apply");
const confirm = process.argv.includes("--confirm-hotspot-purge");
if (apply && !confirm) {
	console.error("Refusing deletion. Add --confirm-hotspot-purge to --apply.");
	process.exit(1);
}
if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
await mongoose.connect(process.env.MONGO_URI);
try {
	const db = mongoose.connection.db;
	const accounts = await db.collection("accounts").find({ serviceType: "hotspot" }).project({ _id: 1 }).toArray();
	const accountIds = accounts.map((a) => a._id);
	console.log(`Database: ${db.databaseName}; hotspot accounts: ${accountIds.length}; mode: ${apply ? "DELETE" : "PREVIEW"}`);
	if (!apply) {
		console.log(JSON.stringify(await new HardDeleteCleanupService({ db }).cleanup({ accountIds }), null, 2));
	} else {
		const session = await mongoose.startSession();
		try {
			let result;
			await session.withTransaction(async () => {
				result = await new HardDeleteCleanupService({ db }).cleanup({ accountIds, session, dryRun: false });
			});
			console.log(JSON.stringify(result, null, 2));
		} finally {
			await session.endSession();
		}
	}
} catch (error) {
	console.error(error);
	process.exitCode = 1;
} finally {
	await mongoose.disconnect();
}
