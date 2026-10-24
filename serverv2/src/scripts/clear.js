import mongoose from "mongoose";
import "../config/env.js";

await mongoose.connect(process.env.MONGO_URI);

try {
	const db = mongoose.connection.db;

	const accounts = db.collection("accounts");
	const users = db.collection("users");

	const cursor = accounts.find(
		{},
		{
			projection: {
				_id: 1,
				wsnId: 1,
				userId: 1,
				serviceType: 1,
				status: 1,
			},
		}
	);

	const orphaned = [];
	let scanned = 0;

	for await (const account of cursor) {
		scanned++;

		if (
			!account.userId ||
			!mongoose.isValidObjectId(account.userId)
		) {
			orphaned.push({
				accountId: String(account._id),
				wsnId: account.wsnId ?? null,
				serviceType: account.serviceType ?? null,
				reason: "Missing or invalid userId",
			});

			continue;
		}

		const userExists = await users.findOne(
			{ _id: account.userId },
			{ projection: { _id: 1 } }
		);

		if (!userExists) {
			orphaned.push({
				accountId: String(account._id),
				wsnId: account.wsnId ?? null,
				serviceType: account.serviceType ?? null,
				userId: String(account.userId),
				reason: "Referenced user does not exist",
			});
		}
	}

	console.log("\n========== ORPHAN ACCOUNT SCAN ==========");
	console.log("Database:", db.databaseName);
	console.log("Accounts scanned:", scanned);
	console.log("Potential orphan accounts:", orphaned.length);

	console.table(orphaned);

	console.log(
		"\nRead-only scan completed. No records were deleted."
	);
} catch (error) {
	console.error("Orphan scan failed:", error.message);
	process.exitCode = 1;
} finally {
	await mongoose.disconnect();
}